'use strict';

var sqlExec = require('../../modules/sqlExecService.js');

var WaitStatsSocketHandler = function(io, connectionId) {

    var LF = '\n',
        index = 0,
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
                source:
                    "-- Isolate top waits for server instance since last restart or statistics clear" + LF +
                        "WITH Waits AS" + LF +
                        "(SELECT wait_type, wait_time_ms / 1000. AS wait_time_s," + LF +
                        "100. * wait_time_ms / SUM(wait_time_ms) OVER() AS pct," + LF +
                        "ROW_NUMBER() OVER(ORDER BY wait_time_ms DESC) AS rn" + LF +
                        "FROM sys.dm_os_wait_stats" + LF +
                        "WHERE wait_type NOT IN ('CLR_SEMAPHORE','LAZYWRITER_SLEEP','RESOURCE_QUEUE','SLEEP_TASK'" + LF +
                        ",'SLEEP_SYSTEMTASK','SQLTRACE_BUFFER_FLUSH','WAITFOR', 'LOGMGR_QUEUE','CHECKPOINT_QUEUE'" + LF +
                        ",'REQUEST_FOR_DEADLOCK_SEARCH','XE_TIMER_EVENT','BROKER_TO_FLUSH','BROKER_TASK_STOP','CLR_MANUAL_EVENT'" + LF +
                        ",'CLR_AUTO_EVENT','DISPATCHER_QUEUE_SEMAPHORE', 'FT_IFTS_SCHEDULER_IDLE_WAIT'" + LF +
                        ",'XE_DISPATCHER_WAIT', 'XE_DISPATCHER_JOIN', 'SQLTRACE_INCREMENTAL_FLUSH_SLEEP'))" + LF +
                        "SELECT W1.wait_type," + LF +
                        "CAST(W1.wait_time_s AS DECIMAL(12, 2)) AS wait_time_s," + LF +
                        "CAST(W1.pct AS DECIMAL(12, 2)) AS pct," + LF +
                        "CAST(SUM(W2.pct) AS DECIMAL(12, 2)) AS running_pct" + LF +
                        "FROM Waits AS W1" + LF +
                        "INNER JOIN Waits AS W2" + LF +
                        "ON W2.rn <= W1.rn" + LF +
                        "GROUP BY W1.rn, W1.wait_type, W1.wait_time_s, W1.pct" + LF +
                        "HAVING SUM(W2.pct) - W1.pct < 99 OPTION (RECOMPILE); -- percentage threshold" + LF +
                        "" + LF +
                        "SELECT CAST(100.0 * SUM(signal_wait_time_ms) / SUM (wait_time_ms) AS NUMERIC(20,2))" + LF +
                        "AS [PctSignalCPUWaits]," + LF +
                        "CAST(100.0 * SUM(wait_time_ms - signal_wait_time_ms) / SUM (wait_time_ms) AS NUMERIC(20,2))" + LF +
                        "AS [PctResourceWaits]" + LF +
                        "FROM sys.dm_os_wait_stats OPTION (RECOMPILE);" + LF
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
                data.data = {
                    stats: result[0],
                    breakdown: result[1]
                };
            }

            io.of("/waitStats").clients().forEach(function(socket) {
                if(socket.customData && socket.customData.connectionId === connectionId) {
                    socket.emit('waitStats', data);
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
                    .of("/waitStats")
                    .on('connection', function (socket) {

                        socket.on('setConnection', function(data) {
                            var connectionId = data.connection;
                            socket.customData = {
                                connectionId: connectionId
                            };
                            if(!socketHandlers[connectionId]) {
                                socketHandlers[connectionId] = new WaitStatsSocketHandler(io, connectionId);
                            }
                            socketHandlers[connectionId].activate();
                        });
                    });
            }
        }
    }
};
