require('dotenv').config();

const restify = require('restify');

const { connectRabbitMQ } = require('./config/rabbitmq');

const consumirMensagens = require('./consumers/reserva.consumer');

const server = restify.createServer();

server.use(restify.plugins.bodyParser());

require('./routes/auth.routes')(server);
require('./routes/quarto.routes')(server);
require('./routes/tipoQuarto.routes')(server);
require('./routes/foto.routes')(server);

async function startServer() {

    await connectRabbitMQ();

    await consumirMensagens();

    server.listen(process.env.PORT, () => {

        console.log(`Servidor rodando na porta ${process.env.PORT}`);
    });
}

startServer();