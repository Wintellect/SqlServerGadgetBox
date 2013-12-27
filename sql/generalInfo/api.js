'use strict';

module.exports = {
    register: function(app) {

        app.get('/api/generalInfo', function(req, res) {

            var edge = require('edge'),
                sqlReader = edge.func("./modules/SqlDataReader.cs"),
                sqlInfo = {
                    connectionString: "Data Source=localhost;Initial Catalog=master;Integrated Security=True",
                    source: "SELECT @@VERSION AS [ProductDescription]," +
                        "SERVERPROPERTY('productversion') AS [ProductVersionNumber]," +
                        "SERVERPROPERTY('productlevel') AS [ProductLevel]," +
                        "SERVERPROPERTY('edition') AS [ProductEdition]" +
                        "EXEC xp_msver"
                };

            sqlReader(sqlInfo, function(err, result) {
                if (err) throw error;
                res.json({
                    version: result[0],
                    properties: result[1]
                });
            });
        });
    }
};
