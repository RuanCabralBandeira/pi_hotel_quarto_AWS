const controller = require('../controllers/foto.controller');
const auth = require('../middlewares/auth');

module.exports = (server) => {

    server.get('/api/quartos/:quartoId/fotos', controller.getByQuarto);

    server.get('/api/fotos/:fotoId', controller.getById);

    server.post('/api/quartos/:quartoId/fotos', auth, controller.create);

    server.put('/api/fotos/:fotoId', auth, controller.update);

    server.patch('/api/fotos/:fotoId', auth, controller.patch);

    server.del('/api/fotos/:fotoId', auth, controller.remove);
};