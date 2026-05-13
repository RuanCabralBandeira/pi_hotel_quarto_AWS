const prisma = require('../config/prisma');

exports.getAll = async (req, res) => {

    const tipos = await prisma.tipoQuarto.findMany();

    res.send(tipos);
};

exports.getById = async (req, res) => {

    const tipo = await prisma.tipoQuarto.findUnique({

        where: {
            id: Number(req.params.id)
        }
    });

    res.send(tipo);
};

exports.create = async (req, res) => {

    const tipo = await prisma.tipoQuarto.create({

        data: req.body
    });

    res.send(tipo);
};

exports.update = async (req, res) => {

    const tipo = await prisma.tipoQuarto.update({

        where: {
            id: Number(req.params.id)
        },

        data: req.body
    });

    res.send(tipo);
};

exports.patch = async (req, res) => {

    const tipo = await prisma.tipoQuarto.update({

        where: {
            id: Number(req.params.id)
        },

        data: req.body
    });

    res.send(tipo);
};

exports.remove = async (req, res) => {

    await prisma.tipoQuarto.delete({

        where: {
            id: Number(req.params.id)
        }
    });

    res.send({
        message: 'Tipo deletado'
    });
};