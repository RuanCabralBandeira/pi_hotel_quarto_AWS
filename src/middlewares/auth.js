const jwt = require('jsonwebtoken');

// Valida o JWT (Bearer) e injeta req.user = { id, login, role }.
// Padrão Restify: next(false) corta o fluxo imediatamente.
function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.send(401, { erro: 'Token não fornecido.' });
        return next(false);
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.send(401, { erro: 'Token com formato inválido.' });
        return next(false);
    }

    jwt.verify(parts[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.send(401, { erro: 'Token inválido ou expirado.' });
            return next(false);
        }
        req.user = decoded;
        return next();
    });
}

// Exige que o usuário autenticado seja Admin.
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'Admin') {
        res.send(403, { erro: 'Acesso negado: requer perfil Admin.' });
        return next(false);
    }
    return next();
}

module.exports = { auth, requireAdmin };
