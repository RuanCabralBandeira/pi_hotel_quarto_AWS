# Contexto — MS Quarto (pi_hotel_quarto)

- **GitHub:** https://github.com/claracatarin4/pi_hotel_quarto
- **Stack:** Node + Restify + Prisma (MySQL) · porta **9533** · gateway `/20261prj5/hotel/quarto`
- **Prefixo interno `/api`:** o IIS remove `/20261prj5/hotel/quarto`, então o container recebe `/api/quartos`.
- **Contexto geral do projeto:** ver `CONTEXTO.md` do front (https://github.com/claracatarin4/frontHotelaria).

## ⚠️ COMMIT PENDENTE (fazer na faculdade — push estava bloqueado por 403)
Em 2026-06-22 implementei **autenticação/autorização** aqui, mas a conta `RuanCabralBandeira`
não tem permissão de escrita neste repo (push deu **403**). O commit existe **local** (`76c0ab4`).

**O que fazer amanhã:** com uma conta que tenha acesso de escrita (a `claracatarin4`, ou adicionar
o Ruan como colaborador), dar `git push`. Se estiver em outra máquina (sem o commit local),
reproduzir as alterações abaixo e commitar.

## Alterações de autenticação (o que mudou)
**Pré-requisito:** `JWT_SECRET` no env deste serviço = **`segredo`** (igual aos outros 4 MS).

### Novo arquivo `src/middlewares/auth.js`
```js
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) { res.send(401, { erro: 'Token não fornecido.' }); return next(false); }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') { res.send(401, { erro: 'Token com formato inválido.' }); return next(false); }
    jwt.verify(parts[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) { res.send(401, { erro: 'Token inválido ou expirado.' }); return next(false); }
        req.user = decoded;
        return next();
    });
}
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'Admin') { res.send(403, { erro: 'Acesso negado: requer perfil Admin.' }); return next(false); }
    return next();
}
module.exports = { auth, requireAdmin };
```

### Rotas — GET público, escrita só Admin
- `quarto.routes.js`, `tipoQuarto.routes.js`, `foto.routes.js`: todos os `GET` ficam **públicos**;
  `POST/PUT/PATCH/DELETE` recebem `auth, requireAdmin` antes do controller.
  Ex.: `server.post('/api/quartos', auth, requireAdmin, controller.create);`
- Em `quarto.routes.js`, **`/api/quartos/reservas` foi movido para ANTES de `/api/quartos/:id`**
  (senão "reservas" é capturado como `:id`).

### Scripts de seed/reset (`scripts/seed-quartos.js`, `scripts/reset-quartos.js`)
- Depois do auth, escrever/apagar quarto exige token de Admin. Os scripts aceitam `TOKEN=<jwt>`:
  `TOKEN="<jwt_admin>" QUARTO_API="http://academico3.rj.senac.br/20261prj5/hotel/quarto" node scripts/seed-quartos.js`
- Banco já foi repovoado com 48 quartos (10 tipos) + 48 fotos em 2026-06-22.

## Modelos (Prisma)
- `TipoQuarto{ id, descricao, status? }`
- `Quarto{ id, preco:Float, numero:String?, status:Int, tipoQuartoId:Int, fotos[], tipoQuarto }`
- `Foto{ foto_id, foto_bin:MediumText(base64), foto_nome, foto_extensao, foto_status, quarto_id }`
- Status do quarto: `1=Disponível, 2=Ocupado, 3=Manutenção` (manual do admin; ocupação por data vem das reservas).
- Eventos RabbitMQ: `QUARTO_CRIADO`, `QUARTO_ATUALIZADO`, `QUARTO_PATCH`, `QUARTO_REMOVIDO`.

## Deploy
- Após o push + build no Jenkins, lembrar do **`iisreset`** (IP do container muda).
- Conferir que o `JWT_SECRET=segredo` está no Infisical/env deste serviço.
