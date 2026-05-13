const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    console.log(req.headers);

    const authHeader = req.headers.authorization;

    console.log('Authorization:', authHeader);

    if (!authHeader) {

        return res.send(401, {
            error: 'Token não informado'
        });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {

        return res.send(401, {
            error: 'Token mal formatado'
        });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {

        return res.send(401, {
            error: 'Token mal formatado'
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        return next();

    } catch (err) {

        console.log(err);

        return res.send(401, {
            error: 'Token inválido'
        });
    }
};