const UserHandler = require('./user.handler');

const initialize = (router) => {
    
    router.get('user/info/:email', async(req, res) => {
        const userHandler = new UserHandler(req.log);
        return userHandler.get(req, res);
    });

    router.post('user/info', (req, res) => {
        const userHandler = new UserHandler(req.log);
        return userHandler.upsert(req, res);
    });

};

module.exports = initialize;