'use strict';

module.exports = {
    register: function(app) {

        app.get('/api/connections', function(req, res) {

            var _ = require('lodash'),
                connectionsSrv = require('../modules/sqlConnectionsService.js');

            connectionsSrv.getConnections(function(err, data) {
                if(err) {
                    res.status(500).send(err.errorThrown);
                }
                else {
                    res.json({
                        connections: _.map(data.connections, function(item) {
                            return {
                                id: item.id,
                                name: item.name
                            };
                        })
                    });
                }
            });
        });
    }
};
