require('dotenv').config();

const restify = require('restify');

const server = restify.createServer();

server.use(restify.plugins.bodyParser());

require('./routes/auth.routes')(server);
require('./routes/quarto.routes')(server);
require('./routes/tipoQuarto.routes')(server);
require('./routes/foto.routes')(server);

server.listen(process.env.PORT, () => {

    console.log(`Servidor rodando na porta ${process.env.PORT}`);
});