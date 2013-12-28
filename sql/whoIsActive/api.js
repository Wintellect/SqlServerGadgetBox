'use strict';

var sqlExec = require('../../modules/sqlExecService.js');

var WhoIsActiveSocketHandler = function(io, connectionId) {

    var index = 0,
        isActive = false;

    return {
        connectionId: connectionId,
        activate: function() {
            if(!isActive) {
                isActive = true;
                emitData();
            }
        }
    };

    function emitData() {
        var sqlInfo = {
                connectionId: connectionId,
                source: "EXEC sp_WhoIsActive"
            };
        sqlExec.readSqlData(sqlInfo, function(err, result) {

            var foundClient = false,
                foundError = false,
                data = {
                    index: index += 1,
                    connectionId: connectionId,
                    data: []
                };

            if (err) {
                data.error = sqlExec.getError(err).error;
                foundError = true;
            }
            else {
                data.data = result[0];
            }

            io.of("/whoIsActive").clients().forEach(function(socket) {
                if(socket.customData && socket.customData.connectionId === connectionId) {
                    socket.emit('whoIsActive', data);
                    foundClient = true;
                }
            });
            if(foundClient && !foundError) {
                setTimeout(emitData, 2500);
            }
            else {
                isActive = false;
            }
        });
    }
};

module.exports = {
    register: function(app) {

        return {
            initializeSockets: function(io) {

                var socketHandlers = {};

                io
                    .of("/whoIsActive")
                    .on('connection', function (socket) {

                        socket.on('setConnection', function(data) {
                            var connectionId = data.connection;
                            socket.customData = {
                                connectionId: connectionId
                            };
                            if(!socketHandlers[connectionId]) {
                                socketHandlers[connectionId] = new WhoIsActiveSocketHandler(io, connectionId);
                            }
                            socketHandlers[connectionId].activate();
                        });
                    });
            }
        }
    }
};
