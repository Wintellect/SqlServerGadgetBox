'use strict';

var portNum = 8888,
    _ = require('lodash'),
    express = require('express'),
    swig = require('swig'),
    http = require('http'),
    gadgetCatalogService = require('./modules/gadgetCatalogService.js'),
    app = express(),
    apiList = [
        "./api/gadgetCatalog.js"
    ];

app.set('port', portNum);

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);
swig.setDefaults({ cache: false });

app.use(express.logger());
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.errorHandler());

app.use('/bower', express.static(__dirname + '/bower_components'));
app.use(app.router);
app.get("/", function(req, res) {
    res.render("../app/index.html", {});
});
app.use(express.static(__dirname + '/app'));

gadgetCatalogService
    .getCatalog(function(err, catalog) {
        if(err) {
            throw err.errorThrown;
        }
        else {

            _.each(catalog, function(item) {

                var list = item.apiList || [];
                apiList = apiList.concat(_.map(list, function(fn) {
                    return item.basePath + "/" + fn;
                }));

                app.get("/" + item.identifier, function(req, res) {
                    res.render(
                        [
                            "..",
                            "sql",
                            item.identifier,
                            "client",
                            "index.html"
                        ].join("/"),
                        {});
                });

//                app.use("/" + item.identifier, express.static([
//                    __dirname,
//                    item.basePath,
//                    'client'
//                ].join('/')));
            });

            _.each(apiList, function(apiFileName) {
                require(apiFileName).register(app);
            });

            http.createServer(app)
                .listen(app.get('port'), function() {
                    console.log("Listening on port " + app.get('port'));
                    console.log("http://localhost:" + app.get('port') + "/");
                });
        }
    });
