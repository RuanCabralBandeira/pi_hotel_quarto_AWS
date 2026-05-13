const prisma = require('../config/prisma');

exports.getAll = async (req, res) => {

    const {
        tipoQuartoId,
        status,
        skip,
        take
    } = req.query;

    const quartos = await prisma.quarto.findMany({

        where: {

            tipoQuartoId: tipoQuartoId
                ? Number(tipoQuartoId)
                : undefined,

            status: status
                ? Number(status)
                : undefined
        },

        skip: skip
            ? Number(skip)
            : 0,

        take: take
            ? Number(take)
            : 10,

        include: {
            tipoQuarto: true,
            fotos: true
        }
    });

    res.send(quartos);
};

exports.getById = async (req, res) => {

    const { id } = req.params;

    const quarto = await prisma.quarto.findUnique({

        where: {
            id: Number(id)
        },

        include: {
            tipoQuarto: true,
            fotos: true
        }
    });

    res.send(quarto);
};

exports.getByPreco = async (req, res) => {

    const { minPreco, maxPreco } = req.query;

    const quartos = await prisma.quarto.findMany({

        where: {

            preco: {

                gte: Number(minPreco),

                lte: Number(maxPreco)
            }
        }
    });

    res.send(quartos);
};

exports.create = async (req, res) => {

    const quarto = await prisma.quarto.create({

        data: req.body
    });

    res.send(quarto);
};

exports.update = async (req, res) => {

    const { id } = req.params;

    const quarto = await prisma.quarto.update({

        where: {
            id: Number(id)
        },

        data: req.body
    });

    res.send(quarto);
};

exports.patch = async (req, res) => {

    const { id } = req.params;

    const quarto = await prisma.quarto.update({

        where: {
            id: Number(id)
        },

        data: req.body
    });

    res.send(quarto);
};

exports.remove = async (req, res) => {

    const { id } = req.params;

    await prisma.quarto.delete({

        where: {
            id: Number(id)
        }
    });

    res.send({
        message: 'Quarto deletado'
    });
};