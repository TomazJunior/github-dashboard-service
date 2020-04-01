const UserHandler = require('./user.handler');

const initialize = (router) => {
    
    router.get('user/info/:email', async(req, res) => {
        const userHandler = new UserHandler(req.log);
        return userHandler.get(req, res);
    });

    router.post('user/:email/login', (req, res) => {
        const userHandler = new UserHandler(req.log);
        return userHandler.login(req, res);
    });

    router.put('user/:email/current-dashboard/:dashboardId', (req, res) => {
        const userHandler = new UserHandler(req.log);
        return userHandler.updateDashboard(req, res);
    });

    router.post('user/logout', async(req, res) => {
        const userHandler = new UserHandler(req.log);
        return userHandler.logout(req, res);
    });

};

module.exports = initialize;