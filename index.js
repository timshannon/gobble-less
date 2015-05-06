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
                var outputName = options.dest;
                if (options.compress) {
                    outputName = path.basename(outputName, path.extname(outputName)) + ".min" + path.extname(outputName);
                }
                var promises = [
                    sander.writeFile(outputdir, outputName, result.css)
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
