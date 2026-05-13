const controller = require('../controllers/auth.controller');

module.exports = (server) => {

    server.post('/login', controller.login);
};