/**
 * Seed de quartos — popula tipos de quarto, 48 quartos e fotos via API.
 *
 * Usa só o fetch nativo do Node 20 (sem dependências). É idempotente:
 * - tipos: cria só os que faltam (compara por descrição)
 * - quartos: pula os números que já existem
 * - cada quarto recebe sua própria foto (linha em `fotos` ligada pelo quarto_id)
 *
 * Como rodar:
 *   node scripts/seed-quartos.js
 *   QUARTO_API="http://academico3.rj.senac.br/20261prj5/hotel/quarto" node scripts/seed-quartos.js
 *   SEM_FOTOS=1 node scripts/seed-quartos.js
 */

const BASE = (process.env.QUARTO_API || 'http://localhost:9533').replace(/\/$/, '');
const SEM_FOTOS = process.env.SEM_FOTOS === '1';
// Após habilitar o auth, escrever quarto exige token de Admin. Passe via TOKEN=...
const TOKEN = process.env.TOKEN || '';

// Tipos de quarto: descrição, preço base e quantos quartos desse tipo (soma = 48)
const TIPOS = [
  { descricao: 'Standard',     preco: 250,  qtd: 10, foto: '1505693416388-ac5ce068fe85' },
  { descricao: 'Casal',        preco: 300,  qtd: 6,  foto: '1522771739844-6a9f6d5f14af' },
  { descricao: 'Solteiro',     preco: 220,  qtd: 5,  foto: '1598928506311-c55ded91a20c' },
  { descricao: 'Luxo',         preco: 480,  qtd: 6,  foto: '1631049307264-da0ec9d70304' },
  { descricao: 'Suíte',        preco: 720,  qtd: 5,  foto: '1582719478250-c89cae4dc85b' },
  { descricao: 'Suíte Master', preco: 950,  qtd: 3,  foto: '1611892440504-42a792e24d32' },
  { descricao: 'Executivo',    preco: 600,  qtd: 4,  foto: '1566073771259-6a8506099945' },
  { descricao: 'Família',      preco: 550,  qtd: 4,  foto: '1590490360182-c33d57733427' },
  { descricao: 'Premium',      preco: 800,  qtd: 3,  foto: '1618773928121-c32242e63f39' },
  { descricao: 'Cobertura',    preco: 1500, qtd: 2,  foto: '1578683010236-d716f9a3f461' },
];

const fotoUrl = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=70`;

// Distribui os 48 quartos em números 101..112, 201..212, ... e intercala os tipos
// (round-robin) para cada andar ter variedade de categorias.
function montarQuartos() {
  const fila = TIPOS.map((t) => ({ descricao: t.descricao, restante: t.qtd }));
  const ordem = [];
  let total = TIPOS.reduce((a, t) => a + t.qtd, 0);
  let i = 0;
  while (ordem.length < total) {
    const t = fila[i % fila.length];
    if (t.restante > 0) { ordem.push(t.descricao); t.restante--; }
    i++;
  }
  // gera números por andar
  const numeros = [];
  for (let andar = 1; andar <= 4; andar++) {
    for (let pos = 1; pos <= 12; pos++) numeros.push(String(andar * 100 + pos));
  }
  return ordem.map((tipo, idx) => ({ tipo, numero: numeros[idx] }));
}

async function fetchJson(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(url, { ...options, headers });
  const txt = await res.text();
  let data;
  try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  return data;
}

async function baixarBase64(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ao baixar imagem`);
  return Buffer.from(await res.arrayBuffer()).toString('base64');
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
    if (mapaTipos[chave]) { console.log(`• tipo "${t.descricao}" já existe (id ${mapaTipos[chave]})`); continue; }
    const criado = await fetchJson(`${BASE}/api/tipos-quarto`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao: t.descricao, status: 1 }),
    });
    const id = criado.id ?? criado.tipo_quarto_id;
    mapaTipos[chave] = id;
    console.log(`✓ tipo "${t.descricao}" criado (id ${id})`);
  }

  // 2. Fotos base64 por tipo (baixa uma vez cada)
  const fotoBase64 = {};
  if (!SEM_FOTOS) {
    for (const t of TIPOS) {
      try { fotoBase64[t.descricao] = await baixarBase64(fotoUrl(t.foto)); console.log(`✓ foto baixada: ${t.descricao}`); }
      catch (e) { console.log(`⚠ falha foto "${t.descricao}": ${e.message}`); }
    }
  }

  // 3. Quartos (pula números já existentes)
  const quartosExistentes = await fetchJson(`${BASE}/api/quartos`).catch(() => []);
  const numerosExistentes = new Set((Array.isArray(quartosExistentes) ? quartosExistentes : []).map((q) => String(q.numero)));
  const precoPorTipo = Object.fromEntries(TIPOS.map((t) => [t.descricao, t.preco]));

  let criados = 0, pulados = 0, comFoto = 0;
  for (const q of montarQuartos()) {
    if (numerosExistentes.has(q.numero)) { pulados++; continue; }
    const tipoQuartoId = mapaTipos[q.tipo.toLowerCase()];
    if (!tipoQuartoId) { console.log(`⚠ tipo "${q.tipo}" sem id, pulando ${q.numero}`); continue; }

    const variacao = Math.round(Math.random() * 100 - 50); // +/- R$50
    const preco = Math.max(100, precoPorTipo[q.tipo] + variacao);

    try {
      const quarto = await fetchJson(`${BASE}/api/quartos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: q.numero, preco, status: 1, tipoQuartoId }),
      });
      const quartoId = quarto.id ?? quarto.quarto_id;
      criados++;

      const b64 = fotoBase64[q.tipo];
      if (b64) {
        try {
          await fetchJson(`${BASE}/api/quartos/${quartoId}/fotos`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ foto_bin: b64, foto_nome: `quarto-${q.numero}`, foto_extensao: 'jpeg', foto_status: 1 }),
          });
          comFoto++;
        } catch (e) { console.log(`⚠ quarto ${q.numero} sem foto: ${e.message}`); }
      }
      console.log(`✓ ${q.numero} (${q.tipo}) — R$ ${preco}${b64 ? ' +foto' : ''}`);
    } catch (e) { console.log(`✗ erro no quarto ${q.numero}: ${e.message}`); }
  }

  console.log(`\n✅ Concluído: ${criados} criados, ${pulados} já existiam, ${comFoto} com foto.\n`);
}

main().catch((e) => { console.error('Erro fatal no seed:', e); process.exit(1); });
