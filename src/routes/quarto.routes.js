const controller = require('../controllers/quarto.controller');
const { auth, requireAdmin } = require('../middlewares/auth');

module.exports = (server) => {

    // Leitura: pública (catálogo de quartos)
    server.get('/api/quartos', controller.getAll);

    server.get('/api/quartos/preco', controller.getByPreco);

    server.get('/api/quartos/reservas', controller.buscarReservas);

    server.get('/api/quartos/:id', controller.getById);

    // Escrita: somente Admin autenticado
    server.post('/api/quartos', auth, requireAdmin, controller.create);

    server.put('/api/quartos/:id', auth, requireAdmin, controller.update);

    server.patch('/api/quartos/:id', auth, requireAdmin, controller.patch);

    server.del('/api/quartos/:id', auth, requireAdmin, controller.remove);
};
