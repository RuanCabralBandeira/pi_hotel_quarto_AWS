const prisma = require('../config/prisma');
const { enviarMensagem } = require('../producers/quarto.producer');

// 1. Busca todos os quartos
exports.getAll = async (req, res, next) => {
    try {
        const quartos = await prisma.quarto.findMany({
            include: { tipoQuarto: true, fotos: true }
        });
        res.send(quartos);
    } catch (error) {
        res.send(500, { error: 'Erro ao buscar quartos', detalhes: error.message });
    }
    return next();
};

// 2. Busca por ID
exports.getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const idNumero = Number(id);

        if (!id || isNaN(idNumero)) {
            res.send(400, { error: 'ID inválido ou não informado' });
            return next();
        }

        const quarto = await prisma.quarto.findUnique({
            where: { id: idNumero },
            include: { tipoQuarto: true, fotos: true }
        });

        if (!quarto) {
            res.send(404, { error: 'Quarto não encontrado' });
            return next();
        }

        res.send(quarto);
    } catch (error) {
        res.send(500, { error: 'Erro ao buscar quarto', detalhes: error.message });
    }
    return next();
};

// 3. Busca por Preço (Protegido contra valores vazios/NaN)
exports.getByPreco = async (req, res, next) => {
    try {
        const { minPreco, maxPreco } = req.query;
        
        // Se não enviar, define valores padrão para não quebrar o Prisma
        const min = minPreco ? Number(minPreco) : 0;
        const max = maxPreco ? Number(maxPreco) : 999999;

        if (isNaN(min) || isNaN(max)) {
            res.send(400, { error: 'Os valores de preço devem ser números válidos' });
            return next();
        }

        const quartos = await prisma.quarto.findMany({
            where: {
                preco: { gte: min, lte: max }
            }
        });

        res.send(quartos);
    } catch (error) {
        res.send(500, { error: 'Erro ao filtrar por preço', detalhes: error.message });
    }
    return next();
};

// 4. Cria Quarto
exports.create = async (req, res, next) => {
    try {
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

        res.send(21, quarto); // 201 = Created
    } catch (error) {
        res.send(400, { error: 'Erro ao criar quarto. Verifique os dados enviados.', detalhes: error.message });
    }
    return next();
};

// 5. Atualiza Quarto (PUT)
exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const idNumero = Number(id);

        if (isNaN(idNumero)) {
            res.send(400, { error: 'ID inválido' });
            return next();
        }

        const quarto = await prisma.quarto.update({
            where: { id: idNumero },
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
    } catch (error) {
        res.send(500, { error: 'Erro ao atualizar quarto. O ID existe?', detalhes: error.message });
    }
    return next();
};

// 6. Atualiza Parcial (PATCH)
exports.patch = async (req, res, next) => {
    try {
        const { id } = req.params;
        const idNumero = Number(id);

        if (isNaN(idNumero)) {
            res.send(400, { error: 'ID inválido' });
            return next();
        }

        const quarto = await prisma.quarto.update({
            where: { id: idNumero },
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
    } catch (error) {
        res.send(500, { error: 'Erro ao modificar quarto', detalhes: error.message });
    }
    return next();
};

// 7. Remove Quarto
exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const idNumero = Number(id);

        if (isNaN(idNumero)) {
            res.send(400, { error: 'ID inválido' });
            return next();
        }

        await prisma.quarto.delete({
            where: { id: idNumero }
        });

        await enviarMensagem({
            evento: 'QUARTO_REMOVIDO',
            id: idNumero
        });

        res.send({ message: 'Quarto deletado com sucesso' });
    } catch (error) {
        res.send(500, { error: 'Erro ao deletar quarto. Ele já foi deletado ou não existe?', detalhes: error.message });
    }
    return next();
};