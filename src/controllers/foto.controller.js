const prisma = require('../config/prisma');

exports.getByQuarto = async (req, res) => {

    try {

        const quartoId = Number(req.params.quartoId);

        console.log('GET FOTOS - quartoId:', quartoId);

        const fotos = await prisma.foto.findMany({
            where: {
                quarto_id: quartoId
            }
        });

        res.send(fotos);

    } catch (erro) {

        console.error(erro);

        res.send(500, {
            error: erro.message
        });
    }
};

exports.getById = async (req, res) => {

    try {

        const foto = await prisma.foto.findUnique({
            where: {
                foto_id: Number(req.params.fotoId)
            }
        });

        res.send(foto);

    } catch (erro) {

        console.error(erro);

        res.send(500, {
            error: erro.message
        });
    }
};

exports.create = async (req, res) => {

    try {

        const quartoId = Number(req.params.quartoId);

        if (!quartoId) {
            return res.send(400, {
                error: 'quartoId não informado'
            });
        }

        const foto = await prisma.foto.create({
            
            data: {
                        foto_bin: req.body.foto_bin,

                        foto_nome: req.body.foto_nome,

                        foto_extensao: req.body.foto_extensao,

                        foto_status: Number(req.body.foto_status || 1),
                        
                        quarto_id: quartoId
                    }
        });

        res.send(foto);

    } catch (erro) {

        console.error(erro);

        res.send(500, {
            error: erro.message
        });
    }
};

exports.update = async (req, res) => {

    try {

        const foto = await prisma.foto.update({

            where: {
                foto_id: Number(req.params.fotoId)
            },

            data: req.body
        });

        res.send(foto);

    } catch (erro) {

        console.error(erro);

        res.send(500, {
            error: erro.message
        });
    }
};

exports.patch = async (req, res) => {

    try {

        const foto = await prisma.foto.update({

            where: {
                foto_id: Number(req.params.fotoId)
            },

            data: req.body
        });

        res.send(foto);

    } catch (erro) {

        console.error(erro);

        res.send(500, {
            error: erro.message
        });
    }
};

exports.remove = async (req, res) => {

    try {

        await prisma.foto.delete({

            where: {
                foto_id: Number(req.params.fotoId)
            }
        });

        res.send({
            message: 'Foto deletada'
        });

    } catch (erro) {

        console.error(erro);

        res.send(500, {
            error: erro.message
        });
    }
};