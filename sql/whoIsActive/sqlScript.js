'use strict';

module.exports = {
    register: function(app) {

        app.get('/whoIsActive/sqlScript', function(req, res){

            var fs = require('fs'),
                file = __dirname + '/who_is_active_v11_11.sql',
                filestream;

            res.setHeader('Content-disposition', 'attachment; filename=who_is_active_v11_11.sql');
            res.setHeader('Content-type', 'text/plain');

            filestream = fs.createReadStream(file);
            filestream.pipe(res);
        });
    }
};
