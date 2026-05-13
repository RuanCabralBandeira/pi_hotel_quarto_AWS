const prisma = require('../config/prisma');

exports.getByQuarto = async (req, res) => {

    const fotos = await prisma.foto.findMany({

        where: {
            quarto_id: Number(req.params.quartoId)
        }
    });

    res.send(fotos);
};

exports.getById = async (req, res) => {

    const foto = await prisma.foto.findUnique({

        where: {
            foto_id: Number(req.params.fotoId)
        }
    });

    res.send(foto);
};

exports.create = async (req, res) => {

    const foto = await prisma.foto.create({

        data: {

            foto_nome: req.body.foto_nome,

            foto_extensao: req.body.foto_extensao,

            foto_status: req.body.foto_status || 1,

            quarto_id: Number(req.params.quartoId)
        }
    });

    res.send(foto);
};

exports.update = async (req, res) => {

    const foto = await prisma.foto.update({

        where: {
            foto_id: Number(req.params.fotoId)
        },

        data: req.body
    });

    res.send(foto);
};

exports.patch = async (req, res) => {

    const foto = await prisma.foto.update({

        where: {
            foto_id: Number(req.params.fotoId)
        },

        data: req.body
    });

    res.send(foto);
};

exports.remove = async (req, res) => {

    await prisma.foto.delete({

        where: {
            foto_id: Number(req.params.fotoId)
        }
    });

    res.send({
        message: 'Foto deletada'
    });
};