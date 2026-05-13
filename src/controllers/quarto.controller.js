const prisma = require('../config/prisma');
exports.getByPreco = async (req, res, next) => {

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

    next();
};

exports.create = async (req, res, next) => {

    const quarto = await prisma.quarto.create({
        data: req.body
    });

    res.send(quarto);

    next();
};

exports.update = async (req, res, next) => {

    const { id } = req.params;

    const quarto = await prisma.quarto.update({

        where: {
            id: Number(id)
        },

        data: req.body
    });

    res.send(quarto);

    next();
};

exports.patch = async (req, res, next) => {

    const { id } = req.params;

    const quarto = await prisma.quarto.update({

        where: {
            id: Number(id)
        },

        data: req.body
    });

    res.send(quarto);

    next();
};

exports.remove = async (req, res, next) => {

    const { id } = req.params;

    await prisma.quarto.delete({

        where: {
            id: Number(id)
        }
    });

    res.send({ message: 'Quarto deletado' });

    next();
};