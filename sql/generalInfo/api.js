'use strict';

module.exports = {
    register: function(app) {

        var sqlExec = require('../../modules/sqlExecService.js');

        app.get('/api/generalInfo', function(req, res) {

            var sqlInfo = {
                    connectionId: req.query.connection,
                    source: "SELECT @@VERSION AS [ProductDescription], " +
                        "SERVERPROPERTY('productversion') AS [ProductVersionNumber], " +
                        "SERVERPROPERTY('productlevel') AS [ProductLevel], " +
                        "SERVERPROPERTY('edition') AS [ProductEdition] " +
                        "EXEC xp_msver"
                };

            sqlExec.readSqlData(sqlInfo, function(err, result) {
                if (err) {
                    res.json(500, sqlExec.getError(err));
                }
                else {
                    res.json({
                        version: result[0],
                        properties: result[1]
                    });
                }
            });
        });
    }
};
