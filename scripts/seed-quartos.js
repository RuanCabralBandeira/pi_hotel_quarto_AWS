/**
 * Seed de quartos — popula tipos de quarto, ~48 quartos e fotos via API.
 *
 * Usa só o fetch nativo do Node 20 (sem dependências). É idempotente:
 * - tipos: cria só os que faltam (compara por descrição)
 * - quartos: pula os números que já existem
 *
 * Como rodar:
 *   # contra um MS Quarto local (porta 9533)
 *   node scripts/seed-quartos.js
 *
 *   # contra o gateway da faculdade (CUIDADO: escreve no banco de produção)
 *   QUARTO_API="http://academico3.rj.senac.br/20261prj5/hotel/quarto" node scripts/seed-quartos.js
 *
 *   # sem baixar fotos (mais rápido / sem internet)
 *   SEM_FOTOS=1 node scripts/seed-quartos.js
 */

const BASE = (process.env.QUARTO_API || 'http://localhost:9533').replace(/\/$/, '');
const SEM_FOTOS = process.env.SEM_FOTOS === '1';

// Tipos de quarto desejados (descricao -> preço base por noite)
const TIPOS = [
  { descricao: 'Standard',   preco: 250 },
  { descricao: 'Luxo',       preco: 480 },
  { descricao: 'Suíte',      preco: 720 },
  { descricao: 'Executivo',  preco: 600 },
  { descricao: 'Família',    preco: 550 },
  { descricao: 'Cobertura',  preco: 1200 },
];

// Uma foto (Unsplash) por tipo — baixada e convertida em base64 na hora
const FOTO_POR_TIPO = {
  'Standard':  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&q=80',
  'Luxo':      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80',
  'Suíte':     'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80',
  'Executivo': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80',
  'Família':   'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80',
  'Cobertura': 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=80',
};

// Distribuição dos 48 quartos: 4 andares x 12 quartos. Tipo por posição no andar.
// posições 1-5 Standard, 6-8 Luxo, 9-10 Executivo, 11 Família, 12 Suíte; andar 4 troca Suíte->Cobertura
function montarQuartos() {
  const lista = [];
  for (let andar = 1; andar <= 4; andar++) {
    for (let pos = 1; pos <= 12; pos++) {
      const numero = String(andar * 100 + pos); // 101..112, 201..212, ...
      let tipo;
      if (pos <= 5) tipo = 'Standard';
      else if (pos <= 8) tipo = 'Luxo';
      else if (pos <= 10) tipo = 'Executivo';
      else if (pos === 11) tipo = 'Família';
      else tipo = andar === 4 ? 'Cobertura' : 'Suíte';
      lista.push({ numero, tipo });
    }
  }
  return lista;
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const txt = await res.text();
  let data;
  try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  return data;
}

async function baixarBase64(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ao baixar imagem`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.toString('base64');
}

async function main() {
  console.log(`\n🌱 Seed de quartos → ${BASE}`);
  if (BASE.includes('academico3')) console.log('⚠️  ATENÇÃO: apontando para o gateway de PRODUÇÃO.\n');

  // 1. Tipos de quarto (cria os que faltam)
  const tiposExistentes = await fetchJson(`${BASE}/api/tipos-quarto`).catch(() => []);
  const mapaTipos = {};
  for (const t of Array.isArray(tiposExistentes) ? tiposExistentes : []) {
    if (t?.descricao) mapaTipos[t.descricao.toLowerCase()] = t.id;
  }
  for (const t of TIPOS) {
    const chave = t.descricao.toLowerCase();
    if (mapaTipos[chave]) {
      console.log(`• tipo "${t.descricao}" já existe (id ${mapaTipos[chave]})`);
      continue;
    }
    const criado = await fetchJson(`${BASE}/api/tipos-quarto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao: t.descricao, status: 1 }),
    });
    const id = criado.id ?? criado.tipo_quarto_id;
    mapaTipos[chave] = id;
    console.log(`✓ tipo "${t.descricao}" criado (id ${id})`);
  }

  // 2. Fotos base64 por tipo (uma vez cada)
  const fotoBase64 = {};
  if (!SEM_FOTOS) {
    for (const t of TIPOS) {
      const url = FOTO_POR_TIPO[t.descricao];
      if (!url) continue;
      try {
        fotoBase64[t.descricao] = await baixarBase64(url);
        console.log(`✓ foto baixada para "${t.descricao}"`);
      } catch (e) {
        console.log(`⚠ falha ao baixar foto de "${t.descricao}": ${e.message}`);
      }
    }
  }

  // 3. Quartos (pula números já existentes)
  const quartosExistentes = await fetchJson(`${BASE}/api/quartos`).catch(() => []);
  const numerosExistentes = new Set(
    (Array.isArray(quartosExistentes) ? quartosExistentes : []).map((q) => String(q.numero))
  );

  const precoPorTipo = Object.fromEntries(TIPOS.map((t) => [t.descricao, t.preco]));
  let criados = 0, pulados = 0, comFoto = 0;

  for (const q of montarQuartos()) {
    if (numerosExistentes.has(q.numero)) { pulados++; continue; }
    const tipoQuartoId = mapaTipos[q.tipo.toLowerCase()];
    if (!tipoQuartoId) { console.log(`⚠ tipo "${q.tipo}" sem id, pulando quarto ${q.numero}`); continue; }

    // pequena variação de preço por quarto (+/- até R$50)
    const variacao = Math.round((Math.random() * 100 - 50));
    const preco = Math.max(100, precoPorTipo[q.tipo] + variacao);

    try {
      const quarto = await fetchJson(`${BASE}/api/quartos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: q.numero, preco, status: 1, tipoQuartoId }),
      });
      const quartoId = quarto.id ?? quarto.quarto_id;
      criados++;

      const b64 = fotoBase64[q.tipo];
      if (b64) {
        try {
          await fetchJson(`${BASE}/api/quartos/${quartoId}/fotos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              foto_bin: b64,
              foto_nome: `quarto-${q.numero}`,
              foto_extensao: 'jpg',
              foto_status: 1,
            }),
          });
          comFoto++;
        } catch (e) {
          console.log(`⚠ quarto ${q.numero} criado, mas falhou a foto: ${e.message}`);
        }
      }
      console.log(`✓ quarto ${q.numero} (${q.tipo}) — R$ ${preco}${b64 ? ' +foto' : ''}`);
    } catch (e) {
      console.log(`✗ erro no quarto ${q.numero}: ${e.message}`);
    }
  }

  console.log(`\n✅ Concluído: ${criados} criados, ${pulados} já existiam, ${comFoto} com foto.\n`);
}

main().catch((e) => { console.error('Erro fatal no seed:', e); process.exit(1); });
