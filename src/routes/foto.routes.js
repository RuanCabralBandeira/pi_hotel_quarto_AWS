const controller = require('../controllers/foto.controller');

module.exports = (server) => {

    server.get('/api/quartos/:quartoId/fotos', controller.getByQuarto);

    server.get('/api/fotos/:fotoId', controller.getById);

    server.post('/api/quartos/:quartoId/fotos', controller.create);

    server.put('/api/fotos/:fotoId', controller.update);

    server.patch('/api/fotos/:fotoId', controller.patch);

    server.del('/api/fotos/:fotoId', controller.remove);
};