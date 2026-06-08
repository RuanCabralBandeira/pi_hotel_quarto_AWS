const controller = require('../controllers/tipoQuarto.controller');

module.exports = (server) => {

    server.get('/api/tipos-quarto',  controller.getAll);

    server.get('/api/tipos-quarto/:id', controller.getById);

    server.post('/api/tipos-quarto',  controller.create);

    server.put('/api/tipos-quarto/:id',  controller.update);

    server.patch('/api/tipos-quarto/:id',  controller.patch);

    server.del('/api/tipos-quarto/:id',  controller.remove);
};