const controller = require('../controllers/tipoQuarto.controller');
const auth = require('../middlewares/auth');

module.exports = (server) => {

    server.get('/api/tipos-quarto', controller.getAll);

    server.get('/api/tipos-quarto/:id', controller.getById);

    server.post('/api/tipos-quarto', auth, controller.create);

    server.put('/api/tipos-quarto/:id', auth, controller.update);

    server.patch('/api/tipos-quarto/:id', auth, controller.patch);

    server.del('/api/tipos-quarto/:id', auth, controller.remove);
};