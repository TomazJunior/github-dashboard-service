const CardHandler = require('./card.handler');

const initialize = (router) => {
    
    router.get('user/:email/dashboard/:dashboardId/card', async(req, res) => {
        const cardHandler = new CardHandler(req.log);
        return cardHandler.get(req, res);
    });

    router.post('user/:email/dashboard/:dashboardId/card', (req, res) => {
        const cardHandler = new CardHandler(req.log);
        return cardHandler.add(req, res);
    });

    router.put('user/:email/dashboard/:dashboardId/card/:id', (req, res) => {
        const cardHandler = new CardHandler(req.log);
        return cardHandler.update(req, res);
    });

    router.put('user/:email/dashboard/:dashboardId/cards', (req, res) => {
        const cardHandler = new CardHandler(req.log);
        return cardHandler.updateInBatch(req, res);
    });

    router.delete('user/:email/dashboard/:dashboardId/card/:id', (req, res) => {
        const cardHandler = new CardHandler(req.log);
        return cardHandler.remove(req, res);
    }); 
};

module.exports = initialize;