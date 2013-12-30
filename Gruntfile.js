'use strict';

module.exports = function (grunt) {

    grunt.initConfig({

    });

    grunt.registerTask('default', ['server']);
    grunt.registerTask('server', function () {
        var done = this.async(), srv;
        grunt.log.writeln('Starting SQL Tools Web Server.');
        srv = require('./WebServer.js');
        srv.onClose = done;
    });
};
