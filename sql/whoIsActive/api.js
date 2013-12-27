'use strict';

module.exports = {
    register: function(app) {

        var sqlExec = require('../../modules/sqlExecService.js');


        return {
            initializeSockets: function(io) {

                io.sockets.on('connection', function (socket) {

                    var idx = 0;

                    queueSendData();

                    function queueSendData() {
                        sendData();
                        if(idx < 10) {
                            setTimeout(queueSendData, 1000);
                        }
                    }

                    function sendData() {
                        socket.emit('whoIsActive', { index: idx += 1 });
                    }
                });
            }
        }
    }
};
