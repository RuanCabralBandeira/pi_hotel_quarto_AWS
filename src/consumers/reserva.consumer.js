const { getCanal } = require('../config/rabbitmq');
const prisma = require('../config/prisma');

const iniciarConsumerReserva = async () => {
    try {
        const canal = getCanal();
        if (!canal) throw new Error('Canal RabbitMQ não disponível para o Consumer.');

        // Nome da fila que o serviço de Reserva vai usar para publicar que um quarto foi alugado
        const nomeFila = 'reserva_status'; 

        await canal.assertQueue(nomeFila, { durable: true });

        console.log(`🎧 [Consumer] A escutar eventos na fila '${nomeFila}'...`);

        canal.consume(nomeFila, async (mensagem) => {
            if (mensagem !== null) {
                const dadosReserva = JSON.parse(mensagem.content.toString());
                
                console.log(`📥 [Consumer] Recebida confirmação de reserva:`, dadosReserva);

                try {
                    // Atualiza o cliente no Prisma com o quarto_id recebido da Reserva
                    await prisma.cliente.update({
                        where: { cliente_id: parseInt(dadosReserva.cliente_id) },
                        data: { quarto_id: parseInt(dadosReserva.quarto_id) }
                    });

                    console.log(`✅ [Consumer] Cliente ${dadosReserva.cliente_id} atualizado com o Quarto ${dadosReserva.quarto_id}`);
                    
                    // Confirma ao RabbitMQ que a mensagem foi processada com sucesso
                    canal.ack(mensagem);
                } catch (erroPrisma) {
                    console.error(`❌ [Consumer] Erro ao atualizar cliente no banco:`, erroPrisma);
                    // Em caso de erro grave (ex: cliente não existe), não devolvemos a mensagem para a fila infinitamente
                    canal.nack(mensagem, false, false); 
                }
            }
        });
    } catch (erro) {
        console.error('❌ Erro ao iniciar o Consumer de Reserva:', erro);
    }
};

module.exports = { iniciarConsumerReserva };