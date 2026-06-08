const controller = require('../controllers/quarto.controller');


module.exports = (server) => {

    server.get('/api/quartos', controller.getAll);

    server.get('/api/quartos/preco', controller.getByPreco);

    server.get('/api/quartos/:id', controller.getById);
    
    server.post('/api/quartos', controller.create);

    server.put('/api/quartos/:id',  controller.update);

    server.patch('/api/quartos/:id',  controller.patch);

    server.del('/api/quartos/:id',  controller.remove);
};