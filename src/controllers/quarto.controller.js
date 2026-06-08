const prisma = require('../config/prisma');
const { enviarMensagem } = require('../producers/quarto.producer');

exports.getAll = async (req, res) => {

    const quartos = await prisma.quarto.findMany({
        include: {
            tipoQuarto: true,
            fotos: true
        }
    });

    res.send(quartos);
};

exports.getById = async (req, res) => {

    const { id } = req.params;

    if (!id) {
        return res.send(400, {
            error: 'ID não informado'
        });



    }


    const quarto = await prisma.quarto.findUnique({

        where: {
            id: Number(id)
        },

        include: {
            tipoQuarto: true,
            fotos: true
        }
    });

    if (!quarto) {
        return res.send(404, {
            error: 'Quarto não encontrado'
        });
    }

    res.send(quarto);
};

exports.getById = async (req, res) => {

    const { id } = req.params;

    console.log('ID:', id);

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

    await enviarMensagem({
        evento: 'QUARTO_CRIADO',
        id: quarto.id,
        numero: quarto.numero,
        status: quarto.status,
        tipoQuartoId: quarto.tipoQuartoId
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



    await enviarMensagem({
        evento: 'QUARTO_ATUALIZADO',
        id: quarto.id,
        numero: quarto.numero,
        status: quarto.status,
        tipoQuartoId: quarto.tipoQuartoId
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



    await enviarMensagem({
        evento: 'QUARTO_PATCH',
        id: quarto.id,
        numero: quarto.numero,
        status: quarto.status,
        tipoQuartoId: quarto.tipoQuartoId
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

    await enviarMensagem({
        evento: 'QUARTO_REMOVIDO',
        id: Number(id)
    });

    res.send({
        message: 'Quarto deletado'
    });


};