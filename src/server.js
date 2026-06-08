require('dotenv').config();
const restify = require('restify');
const { connectRabbitMQ } = require("./config/rabbitmq");

const server = restify.createServer({ name: "api-hotel-quarto" });

server.use(restify.plugins.queryParser()); 
server.use(restify.plugins.bodyParser());

// Função principal para garantir a ordem correta de inicialização
async function startServer() {
    try {
        // 1. Conecta ao RabbitMQ primeiro e aguarda
        await connectRabbitMQ();
        console.log("📦 [RabbitMQ] Conexão estabelecida com sucesso!");

        // 2. Só depois de conectado, carrega as rotas
        require('./routes/quarto.routes')(server);
        require('./routes/tipoQuarto.routes')(server);
        require('./routes/foto.routes')(server);

        // 3. Por fim, inicia o servidor
        const PORT = process.env.PORT || 9532;
        server.listen(PORT, () => {
            console.log(`${server.name} rodando na porta ${PORT} | Aguardando chamadas do API Gateway`);
        });

    } catch (error) {
        console.error("❌ Falha ao iniciar o servidor: erro na conexão com o RabbitMQ", error);
        process.exit(1); // Encerra o processo se não conseguir conectar ao broker
    }
}

// Executa a função
startServer();