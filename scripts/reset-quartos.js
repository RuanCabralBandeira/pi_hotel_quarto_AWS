/**
 * Reset de quartos — apaga TODOS os quartos e suas fotos via API.
 *
 * Usa só o fetch nativo do Node 20 (sem dependências).
 * Ordem segura: apaga as fotos de cada quarto ANTES do quarto (a FK não permite o contrário).
 *
 * ⚠️ DESTRUTIVO. Por padrão roda em modo "dry-run" (só mostra o que apagaria).
 *    Para apagar de verdade, defina CONFIRMA=SIM.
 *
 * ⚠️ Ao apagar um quarto, o MS Quarto emite QUARTO_REMOVIDO e o MS Reserva
 *    CANCELA as reservas vinculadas (reserva_status -> 3). As reservas ficam órfãs.
 *
 * Como rodar:
 *   # 1) ver o que seria apagado (não apaga nada)
 *   QUARTO_API="http://academico3.rj.senac.br/20261prj5/hotel/quarto" node scripts/reset-quartos.js
 *
 *   # 2) apagar de verdade
 *   CONFIRMA=SIM QUARTO_API="http://academico3.rj.senac.br/20261prj5/hotel/quarto" node scripts/reset-quartos.js
 *
 *   # também apagar os tipos de quarto (opcional)
 *   CONFIRMA=SIM INCLUIR_TIPOS=1 QUARTO_API="..." node scripts/reset-quartos.js
 */

const BASE = (process.env.QUARTO_API || 'http://localhost:9533').replace(/\/$/, '');
const CONFIRMA = process.env.CONFIRMA === 'SIM';
const INCLUIR_TIPOS = process.env.INCLUIR_TIPOS === '1';

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const txt = await res.text();
  let data;
  try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  return data;
}

async function main() {
  console.log(`\n🧹 Reset de quartos → ${BASE}`);
  if (BASE.includes('academico3')) console.log('⚠️  ATENÇÃO: apontando para o gateway de PRODUÇÃO.');
  console.log(CONFIRMA ? '🔴 MODO REAL: vai apagar de verdade.\n' : '🟡 DRY-RUN: nada será apagado (use CONFIRMA=SIM para apagar).\n');

  const quartos = await fetchJson(`${BASE}/api/quartos`).catch(() => []);
  const lista = Array.isArray(quartos) ? quartos : [];
  const totalFotos = lista.reduce((acc, q) => acc + (Array.isArray(q.fotos) ? q.fotos.length : 0), 0);

  console.log(`Encontrados: ${lista.length} quartos e ${totalFotos} fotos.`);

  let tipos = [];
  if (INCLUIR_TIPOS) {
    tipos = await fetchJson(`${BASE}/api/tipos-quarto`).catch(() => []);
    tipos = Array.isArray(tipos) ? tipos : [];
    console.log(`Tipos de quarto a apagar: ${tipos.length}.`);
  }

  if (!CONFIRMA) {
    console.log('\n(DRY-RUN) Nada foi apagado. Rode com CONFIRMA=SIM para executar.\n');
    return;
  }

  let fotosApagadas = 0, quartosApagados = 0, tiposApagados = 0;

  for (const q of lista) {
    const qid = q.id ?? q.quarto_id;
    // 1) apaga as fotos do quarto primeiro (FK)
    for (const f of Array.isArray(q.fotos) ? q.fotos : []) {
      try {
        await fetchJson(`${BASE}/api/fotos/${f.foto_id}`, { method: 'DELETE' });
        fotosApagadas++;
      } catch (e) {
        console.log(`⚠ falha ao apagar foto ${f.foto_id} do quarto ${qid}: ${e.message}`);
      }
    }
    // 2) apaga o quarto
    try {
      await fetchJson(`${BASE}/api/quartos/${qid}`, { method: 'DELETE' });
      quartosApagados++;
      console.log(`✓ quarto ${q.numero || qid} apagado`);
    } catch (e) {
      console.log(`✗ erro ao apagar quarto ${qid}: ${e.message}`);
    }
  }

  if (INCLUIR_TIPOS) {
    for (const t of tipos) {
      const tid = t.id ?? t.tipo_quarto_id;
      try {
        await fetchJson(`${BASE}/api/tipos-quarto/${tid}`, { method: 'DELETE' });
        tiposApagados++;
      } catch (e) {
        console.log(`⚠ falha ao apagar tipo ${tid}: ${e.message}`);
      }
    }
  }

  console.log(`\n✅ Concluído: ${quartosApagados} quartos, ${fotosApagadas} fotos${INCLUIR_TIPOS ? `, ${tiposApagados} tipos` : ''} apagados.\n`);
}

main().catch((e) => { console.error('Erro fatal no reset:', e); process.exit(1); });
