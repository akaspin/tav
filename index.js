module.exports = tav = { };

// Arguments
Object.defineProperty(tav, "args", {
    value : [],
    enumerable : false
});

Object.defineProperty(tav, "set", {
    /**
     * Sets options.
     * @param spec Specification
     * @param banner Banner
     * @param strict Assume unexpected params as error. 
     */
    value : function(spec, banner, strict) {
        spec = spec || {};
        banner = banner || "Usage:";
        var self = this;
        var incoming = process.argv.slice(2); // incoming params

        /**
         * Returns extra items frob b
         * @param a
         * @param b
         * @returns {Array}
         */
        var arrayDiff = function(a, b) {
            return b.filter(function(i) {
                return a.indexOf(i) == -1;
            });
        };
        /**
         * Check conditions. If help setted - always exit.
         * @param parsed Parsed specs
         */
        var check = function(parsed) {
            var end = false, message = "", code = 0, outer = console.log;
            var setted = Object.keys(self);
            var specced = Object.keys(parsed);
            var required = arrayDiff(setted, specced);
            var unexpected = arrayDiff(specced, setted);
            
            // If any required options is not provided - crash it!
            if (required.length) {
                end = true;
                code = 1;
                outer = console.error;
                message += "Required but not provided:\n    --" 
                        + required.join("\n    --") + "\n";
            }
            // + unexpected
            if (unexpected.length) {
                message += "Unexpected options:\n    --"
                        + unexpected.join("\n    --") + "\n";
            }
            message += (message.length ? 
                    "\nRun with --help for more info" : "");
            
            if (strict && message.length) {
                end = true;
                code = 1;
                outer = console.error;
            }
            
            // If --help, exit without error
            if (incoming.indexOf("--help") != -1) {
                end = true;
                code = 0;
                outer = console.log;
                message = Object.keys(parsed).reduce(function(msg, k) {
                    return msg + parsed[k].note + "\n    --" + k
                    + (parsed[k].req ? " *required\n" : "\n");
                    }, "") + "Help. This message.\n    --help\n";
            }
            
            if (end) {
                // exiting
                outer(banner + "\n");
                outer(message);
                process.exit(code);
            }
        };
        
        // Fill spec and default values
        var parsed = {};
        Object.keys(spec).forEach(function(name) {
            var req = spec[name].value === undefined ? true : false;
            var note = spec[name].note || "Note not provided";
            parsed[name] = {
                req : req,
                note : note
            };
            // If value not required - set it
            if (!req) {
                self[name] = spec[name].value;
            }
        });
        
        // Evaluate process.argv
        var numRe = /^[0-9.]+$/;
        incoming.filter(function(chunk) {
            return chunk != "--help" && chunk != "--";
        })
        .forEach(function(chunk) {
            if (chunk.substring(0,2) == "--") {
                var tokens = chunk.substring(2).split("=");
                var name = tokens[0];
                
                // Expected option - evaluate value
                if (tokens.length == 1) {
                    // Boolean
                    var value = true;
                } else {
                    var value = tokens.length > 2 ?
                            tokens.slice(1).join('=') : tokens[1];
                    if (numRe.test(value)) {
                        value = parseFloat(value); 
                    }
                }
                self[name] = value;
            } else {
                // Just argument
                self.args.push(chunk);
            }
        });
        
        check(parsed);
        return this;
    },
    enumerable : false,
    configurable : false
});

