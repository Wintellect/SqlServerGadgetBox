'use strict';

var GadgetCatalogService = function() {

    var fs = require('fs'),
        async = require('async'),
        initialized = false,
        catalog = {},
        basePath = "./sql";

    return {
        getCatalog: function(callback) {
            if(!initialized) {
                initialized = true;
                async.waterfall(
                    [
                        function(callback) {
                            fs.readdir(basePath, callback);
                        },
                        function(list, callback) {
                            var identifier, gadgetBasePath;
                            async.eachSeries(
                                list,
                                function(file, callback) {
                                    async.waterfall(
                                        [
                                            function(callback) {
                                                identifier = file;
                                                file = basePath + '/' + file;
                                                fs.stat(file, callback);
                                            },
                                            function(stat, callback) {
                                                if (stat && stat.isDirectory()) {
                                                    gadgetBasePath = file;
                                                    file += '/sql-gadget.json';
                                                    fs.stat(file, callback);
                                                }
                                            },
                                            function(stat, callback) {
                                                if (stat && stat.isFile()) {
                                                    fs.readFile(file, callback);
                                                }
                                            },
                                            function(data, callback) {
                                                var jsonData = JSON.parse(data);
                                                jsonData.basePath = gadgetBasePath;
                                                jsonData.identifier = identifier;
                                                callback(null, jsonData);
                                            }
                                        ],
                                        function(err, catalogItem) {
                                            if(catalogItem) {
                                                catalog[catalogItem.identifier] = catalogItem;
                                            }
                                            callback();
                                        });
                                },
                                callback);
                        }
                    ],
                    function(err) {
                        callback(err, catalog);
                    });
            }
            else {
                callback(null, catalog);
            }
        }
    };
};

module.exports = new GadgetCatalogService();
