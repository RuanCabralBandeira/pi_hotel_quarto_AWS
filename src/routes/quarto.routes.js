const controller = require('../controllers/quarto.controller');
const auth = require('../middlewares/auth');

module.exports = (server) => {

    server.get('/api/quartos', controller.getAll);

    server.get('/api/quartos/preco', controller.getByPreco);

    server.get('/api/quartos/:id', controller.getById);

    server.post('/api/quartos', auth, controller.create);

    server.put('/api/quartos/:id', auth, controller.update);

    server.patch('/api/quartos/:id', auth, controller.patch);

    server.del('/api/quartos/:id', auth, controller.remove);
};