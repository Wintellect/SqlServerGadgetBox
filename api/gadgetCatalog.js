'use strict';

module.exports = {
    register: function(app) {

        app.get('/api/gadgetCatalog', function(req, res) {

            var _ = require('lodash'),
                catalogSrv = require('../modules/gadgetCatalogService.js');

            catalogSrv.getCatalog(function(err, catalog) {
                if(err) {
                    res.status(500).send(err.errorThrown);
                }
                else {
                    res.json({
                        gadgets: _.map(catalog, function(item) {
                            return {
                                id: item.identifier,
                                name: item.name,
                                url: "/" + item.identifier,
                                description: "/" + item.identifier + "/" + item.description
                            };
                        })
                    });
                }
            });
        });
    }
};
