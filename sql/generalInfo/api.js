'use strict';

module.exports = {
    register: function(app) {

        app.get('/api/generalInfo', function(req, res, callback) {
            res.json({
                data: "Yep"
            });
        });
    }
};
