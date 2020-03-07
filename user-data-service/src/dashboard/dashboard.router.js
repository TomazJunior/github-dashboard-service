const DashboardHandler = require('./dashboard.handler');

const initialize = (router) => {
    
    router.get('user/:email/dashboard', async(req, res) => {
        const dashboardHandler = new DashboardHandler(req.log);
        return dashboardHandler.get(req, res);
    });

    router.post('user/:email/dashboard', (req, res) => {
        const dashboardHandler = new DashboardHandler(req.log);
        return dashboardHandler.add(req, res);
    });

    router.put('user/:email/dashboard/:id', (req, res) => {
        const dashboardHandler = new DashboardHandler(req.log);
        return dashboardHandler.update(req, res);
    });

    router.delete('user/:email/dashboard/:id', (req, res) => {
        const dashboardHandler = new DashboardHandler(req.log);
        return dashboardHandler.remove(req, res);
    }); 
};

module.exports = initialize;