const DashboardHandler = require('./dashboard.handler');

const initialize = (router) => {
    
    router.get('user/:email/dashboard', (req, res) => {
        const dashboardHandler = new DashboardHandler(req.log);
        return dashboardHandler.getAll(req, res);
    });
};

module.exports = initialize;