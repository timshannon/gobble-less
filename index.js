module.exports = function less(inputdir, outputdir, options, callback) {
    var path = require('path'),
        sander = require('sander');

    if (!options.src || !options.dest) {
        throw new Error('gobble-less requires `options.src` and `options.dest` to be set');
    }
    options.filename = path.join(inputdir, options.src);

    if (options.sourceMap === undefined) {
        // by default, generate sourcemaps and include comments
        options.sourceMap = {};
    }
    var input = sander.readFileSync(options.filename).toString();
    require('less').render(input, options)
        .then(function(result) {
                var promises = [
                    sander.writeFile(outputdir, options.dest, result.css)
                ];

                if (result.map) {
                    promises.push(sander.writeFile(outputdir, options.dest + '.map', result.map));
                }

                sander.Promise.all(promises).then(function() {
                    callback();
                }, callback);

            },
            callback);
};
