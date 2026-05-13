const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {

    const token = jwt.sign(
        { user: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.send({ token });

    next();
};