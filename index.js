module.exports = function less(inputdir, outputdir, options, callback) {
    var path = require('path'),
        sander = require('sander'),
        cheerio = require('cheerio');
    if (!options.src || !options.dest) {
        throw new Error('gobble-less requires `options.src` and `options.dest` to be set');
    }
    options.filename = path.join(inputdir, options.src);

    if (options.sourceMap === undefined) {
        // by default, generate sourcemaps and include comments
        options.sourceMap = {};
    }

    var input;
    var $;
    var fileInput = sander.readFileSync(options.filename).toString();
    if (endsWith(options.filename, ".html") || options.isHTML) {
        options.isHTML = true;
        $ = cheerio.load(fileInput);
        input = $("style[type='text/less']").text();
    } else {
        input = fileInput;
    }
    require('less').render(input, options)
        .then(function(result) {
                var outputName = options.dest;
                if (options.compress && !options.isHTML) {
                    outputName = path.basename(outputName, path.extname(outputName)) + ".min" + path.extname(outputName);
                }
                var out = result.css;

                if (options.isHTML && $) {
                    var before = $.html("style[type='text/less']");
                    var after = $.html($("style[type='text/less']").attr("type", "text/css")).replace(input, result.css);
                    out = fileInput.replace(before, after);
                }

                var promises = [
                    sander.writeFile(outputdir, outputName, out)
                ];

                if (result.map && !options.isHTML) {
                    promises.push(sander.writeFile(outputdir, options.dest + '.map', result.map));
                }

                sander.Promise.all(promises).then(function() {
                    callback();
                }, callback);

            },
            callback);
};

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
