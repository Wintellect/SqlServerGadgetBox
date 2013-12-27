'use strict';

var SqlConnectionsService = function() {

    var _ = require('lodash'),
        fs = require('fs'),
        async = require('async'),
        initialized = false,
        connections = [];

    return {
        getConnections: function(callback) {
            if(!initialized) {
                initialized = true;
                async.waterfall(
                    [
                        function(callback) {
                            fs.readFile("./config/sql.config.json", callback);
                        },
                        function(data, callback) {
                            var jsonData = JSON.parse(data);
                            callback(null, jsonData);
                        }
                    ],
                    function(err, data) {
                        connections = data;
                        connections.connections = _.map(connections.connections, function(item, idx) {
                            var id = '', v = idx;
                            while(v > 0 || id === '') {
                                id += String.fromCharCode(65 + (v%26));
                                v = Math.floor(v / 26);
                            }
                            item.id = id;
                            return item;
                        });
                        callback(err, connections);
                    });
            }
            else {
                callback(null, connections);
            }
        }
    };
};

module.exports = new SqlConnectionsService();
