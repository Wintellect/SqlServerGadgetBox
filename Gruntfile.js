'use strict';

module.exports = function (grunt) {

    grunt.initConfig({

    });

    grunt.registerTask('default', ['server']);
    grunt.registerTask('server', function () {
        var done = this.async();
        grunt.log.writeln('Starting SQL Tools Web Server.');
        require('./WebServer.js')().on('close', done);
    });
};
