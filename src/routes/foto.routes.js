const controller = require('../controllers/foto.controller');
const { auth, requireAdmin } = require('../middlewares/auth');

module.exports = (server) => {

    // Leitura: pública (exibir fotos do quarto)
    server.get('/api/quartos/:quartoId/fotos', controller.getByQuarto);

    server.get('/api/fotos/:fotoId', controller.getById);

    // Escrita: somente Admin autenticado
    server.post('/api/quartos/:quartoId/fotos', auth, requireAdmin, controller.create);

    server.put('/api/fotos/:fotoId', auth, requireAdmin, controller.update);

    server.patch('/api/fotos/:fotoId', auth, requireAdmin, controller.patch);

    server.del('/api/fotos/:fotoId', auth, requireAdmin, controller.remove);
};
