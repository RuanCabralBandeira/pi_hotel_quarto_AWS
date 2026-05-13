const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.send(401, {
            error: 'Token não informado'
        });
    }

    const token = authHeader.split(' ')[1];

    try {

        jwt.verify(token, process.env.JWT_SECRET);

        next();

    } catch (err) {

        return res.send(401, {
            error: 'Token inválido'
        });
    }
};