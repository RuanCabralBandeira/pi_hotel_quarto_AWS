const { getChannel } = require('../config/rabbitmq');

async function enviarMensagem(dados) {

    const channel = getChannel();

    channel.sendToQueue(
        'quarto_status',
        Buffer.from(JSON.stringify(dados))
    );
}

module.exports = {
    enviarMensagem
};