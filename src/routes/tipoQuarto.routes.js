const controller = require('../controllers/tipoQuarto.controller');
const { auth, requireAdmin } = require('../middlewares/auth');

module.exports = (server) => {

    // Leitura: pública
    server.get('/api/tipos-quarto', controller.getAll);

    server.get('/api/tipos-quarto/:id', controller.getById);

    // Escrita: somente Admin autenticado
    server.post('/api/tipos-quarto', auth, requireAdmin, controller.create);

    server.put('/api/tipos-quarto/:id', auth, requireAdmin, controller.update);

    server.patch('/api/tipos-quarto/:id', auth, requireAdmin, controller.patch);

    server.del('/api/tipos-quarto/:id', auth, requireAdmin, controller.remove);
};
