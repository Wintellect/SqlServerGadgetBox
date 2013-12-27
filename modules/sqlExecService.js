'use strict';

var SqlExecService = function() {

    var _ = require('lodash'),
        edge = require('edge'),
        sqlReader = edge.func("./modules/SqlDataReader.cs"),
        connSrv = require('./sqlConnectionsService.js');

    return {
        readSqlData: function(sqlInfo, callback) {
            this.setConnectionString(sqlInfo, function(err) {
                if(err) callback(err);
                sqlReader(sqlInfo, callback);
            });
        },
        setConnectionString: function(sqlInfo, callback) {
            if(sqlInfo.connectionString) {
                callback(null);
            }
            connSrv.getConnections(function(err, data) {
                if(err) callback(err);
                var connStr = "data source=.;initial catalog=master;integrated security=true;",
                    list = data.connections || [],
                    id = sqlInfo.connectionId || "A",
                    found = _.find(list, {id: id});
                if(found) {
                    connStr = found.connectionString;
                }
                sqlInfo.connectionString = connStr;
                callback(null);
            });
        },
        getError: function(err) {
            return {
                error: err.toString()
            };
        }
    };
};

module.exports = new SqlExecService();
