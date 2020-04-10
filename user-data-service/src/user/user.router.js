const UserHandler = require('./user.handler');

const initialize = (router) => {
    
    router.get('user/info/:userId', async(req, res) => {
        const userHandler = new UserHandler(req.log);
        return userHandler.get(req, res);
    });

    router.put('user/:userId/current-dashboard/:dashboardId', (req, res) => {
        const userHandler = new UserHandler(req.log);
        return userHandler.updateDashboard(req, res);
    });

    router.post('user/login', (req, res) => {
        const userHandler = new UserHandler(req.log);
        return userHandler.login(req, res);
    });

    router.post('user/logout', async(req, res) => {
        const userHandler = new UserHandler(req.log);
        return userHandler.logout(req, res);
    });

};

module.exports = initialize;