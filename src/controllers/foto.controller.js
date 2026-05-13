const prisma = require('../config/prisma');

exports.getByQuarto = async (req, res, next) => {

    const fotos = await prisma.foto.findMany({

        where: {
            quartoId: Number(req.params.quartoId)
        }
    });

    res.send(fotos);

    next();
};

exports.getById = async (req, res, next) => {

    const foto = await prisma.foto.findUnique({

        where: {
            id: Number(req.params.fotoId)
        }
    });

    res.send(foto);

    next();
};

exports.create = async (req, res, next) => {

    const foto = await prisma.foto.create({

        data: {
            ...req.body,
            quartoId: Number(req.params.quartoId)
        }
    });

    res.send(foto);

    next();
};

exports.update = async (req, res, next) => {

    const foto = await prisma.foto.update({

        where: {
            id: Number(req.params.fotoId)
        },

        data: req.body
    });

    res.send(foto);

    next();
};

exports.patch = exports.update;

exports.remove = async (req, res, next) => {

    await prisma.foto.delete({

        where: {
            id: Number(req.params.fotoId)
        }
    });

    res.send({ message: 'Foto deletada' });

    next();
};