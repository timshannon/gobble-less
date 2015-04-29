module.exports = function less(inputdir, outputdir, options, callback) {
    var path = require('path'),
        sander = require('sander');

	//TODO: all of this - copied from gobble-sass

    if (!options.src || !options.dest) {
        throw new Error('gobble-less requires `options.src` and `options.dest` to be set');
    }

    options.file = path.join(inputdir, options.src);

    if (options.sourceMap === undefined) {
        // by default, generate sourcemaps and include comments
        options.sourceMap = options.dest + '.map';
        options.sourceMapContents = options.sourceMapContents !== false;
    }

    options.error = callback;

    options.success = function(result) {
        var promises = [
            sander.writeFile(outputdir, options.dest, result.css)
        ];

        if (result.map) {
            promises.push(sander.writeFile(outputdir, options.dest + '.map', result.map));
        }

        sander.Promise.all(promises).then(function() {
            callback();
        }, callback);
    };

    require('less').render(options);
};
