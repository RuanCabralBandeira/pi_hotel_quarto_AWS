const amqp = require('amqplib');
const prisma = require('./prisma');

let channel;

async function connectRabbitMQ() {
    try {

        const url = process.env.RABBITMQ_URL;

        const connection = await amqp.connect(url);

        channel = await connection.createChannel();

        const exchange = 'reserva_events';
        const filaQuarto = 'fila_quarto';

        await channel.assertExchange(
            exchange,
            'fanout',
            { durable: false }
        );

        await channel.assertQueue(
            filaQuarto,
            { durable: true }
        );

        await channel.bindQueue(
            filaQuarto,
            exchange,
            ''
        );

        console.log('📦 [RabbitMQ] Conexão estabelecida com sucesso!');

        channel.consume(filaQuarto, async (msg) => {

            if (!msg) return;

            try {

                const dados = JSON.parse(
                    msg.content.toString()
                );

                console.log(
                    '📥 Evento recebido:',
                    dados
                );

                if (
                    dados.evento === 'RESERVA_APROVADA'
                    && dados.quarto_id
                ) {

                    await prisma.quarto.update({

                        where: {
                            id: Number(dados.quarto_id)
                        },

                        data: {
                            status: 0
                        }
                    });

                    console.log(
                        `✅ Quarto ${dados.quarto_id} reservado`
                    );
                }

                if (
                    dados.evento === 'RESERVA_CANCELADA'
                    && dados.quarto_id
                ) {

                    await prisma.quarto.update({

                        where: {
                            id: Number(dados.quarto_id)
                        },

                        data: {
                            status: 1
                        }
                    });

                    console.log(
                        `✅ Quarto ${dados.quarto_id} liberado`
                    );
                }

                channel.ack(msg);

            } catch (error) {

                console.error(
                    '❌ Erro ao processar mensagem:',
                    error
                );

                channel.nack(
                    msg,
                    false,
                    false
                );
            }
        });

        console.log(
            '🎧 [RabbitMQ] Aguardando eventos de reserva...'
        );

    } catch (error) {

        console.error(
            '❌ Erro ao conectar no RabbitMQ:',
            error
        );
    }
}

function getChannel() {
    return channel;
}

module.exports = {
    connectRabbitMQ,
    getChannel
};