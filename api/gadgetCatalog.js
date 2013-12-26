'use strict';

module.exports = {
    register: function(app) {

        app.get('/api/gadgetCatalog', function(req, res, callback) {

            var fs = require('fs'),
                async = require('async'),
                gadgetFiles = [],
                basePath = "./sql";

            async.waterfall(
                [
                    function(callback) {
                        fs.readdir(basePath, callback);
                    },
                    function(list, callback) {
                        async.eachSeries(
                            list,
                            function(file, callback) {
                                async.waterfall(
                                    [
                                        function(callback) {
                                            file = basePath + '/' + file;
                                            fs.stat(file, callback);
                                        },
                                        function(stat, callback) {
                                            if (stat && stat.isDirectory()) {
                                                file += '/sql-gadget.json';
                                                fs.stat(file, callback);
                                            }
                                        },
                                        function(stat, callback) {
                                            if (stat && stat.isFile()) {
                                                callback(null, file);
                                            }
                                        }
                                    ],
                                    function(err, gadgetFile) {
                                        if(!err) {
                                            gadgetFiles.push(gadgetFile);
                                        }
                                        callback();
                                    });
                            },
                            callback);
                    }
                ],
                function(err) {
                    if(err) {
                        res.status(500).send(err.errorThrown);
                    }
                    else {
                        res.json({
                            gadgets: gadgetFiles
                        });
                    }
                });
        });
    }
};
