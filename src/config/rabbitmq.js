const amqp = require('amqplib');

let channel = null;

async function connectRabbitMQ() {
    try {
        const url = process.env.RABBITMQ_URL;
        if (!url) {
            throw new Error('RABBITMQ_URL não está definida no arquivo .env');
        }

        const connection = await amqp.connect(url);
        channel = await connection.createChannel();

        console.log('📦 [RabbitMQ] Conectado com sucesso!');

        // --- CONSUMER DE CLIENTE REMOVIDO ---
        // Agora o serviço de Quarto não ouve mais eventos de Cliente aqui.
        // ------------------------------------

    } catch (error) {
        console.error('❌ Erro ao conectar no RabbitMQ:', error);
        throw error;
    }
}

function getChannel() {
    if (!channel) {
        throw new Error('O canal do RabbitMQ não foi inicializado.');
    }
    return channel;
}

module.exports = {
    connectRabbitMQ,
    getChannel
};