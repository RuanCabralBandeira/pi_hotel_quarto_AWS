const prisma = require('../config/prisma');

exports.getAll = async (req, res, next) => {

    const tipos = await prisma.tipoQuarto.findMany();

    res.send(tipos);

    next();
};

exports.getById = async (req, res, next) => {

    const tipo = await prisma.tipoQuarto.findUnique({

        where: {
            id: Number(req.params.id)
        }
    });

    res.send(tipo);

    next();
};

exports.create = async (req, res, next) => {

    const tipo = await prisma.tipoQuarto.create({
        data: req.body
    });

    res.send(tipo);

    next();
};

exports.update = async (req, res, next) => {

    const tipo = await prisma.tipoQuarto.update({

        where: {
            id: Number(req.params.id)
        },

        data: req.body
    });

    res.send(tipo);

    next();
};

exports.patch = exports.update;

exports.remove = async (req, res, next) => {

    await prisma.tipoQuarto.delete({

        where: {
            id: Number(req.params.id)
        }
    });

    res.send({ message: 'Tipo deletado' });

    next();
};