# tav*

Command-line options parser for [node.js](http://nodejs.org/).

*In the Phoenician alphabet letter "tav" indicates mark or sign.

## Installation

You can install *tav* as usual - by copy "tav" directory in your 
`~/.node_libraries` or via *npm*

    npm install tav

## Usage

*tav* was written for brain-free usage. All you need - import it and run a 
single function `set` at least once. 

    var opts = require('tav').set();
    console.log(opts, opts.args);

After that, all command-options will be available as regular `Object`. And all 
arguments - as a regular `Array`. :
    
    $node app.js --host=localhost --port=8080 --debug arg1 arg2
    { host: 'localhost', port: 8080, debug: true } [ 'arg1', 'arg2' ]
    
Note, that `.args` not enumerable.

All the options and arguments are separated by spaces. Order of options and 
arguments is not important. Options should be set in "full" notation in 
following form:

    --option_name[=option_value] 

Option names can't contain spaces and be called `set` . Values are processed 
by the following rules:

* If value represents any number, it be evaluated as `Number`
* Otherwise value will be a `String`. `String` values can contain 
  equal sign(`=`). 
* If option value contains spaces, you will need to enclose it in single (`'`) 
  or double quotes (`"`).
* Options without values assumes as `Boolean` `true`.

Some examples:

    --simple_string=simple
    --string_with_spaces='String with spaces'
    --simple_number=345
    --decimal_number=755.235
    --bool_true

All arguments fall into the `Array` `whatever-it-is-imported.args` in the order 
which they were at the command line.

Also there is a special option `--help`. But we will consider it in the next 
section.

## Options specifications and banners

Naturally, you can describe the options. To do this, simply some specifications
to `set` function. Also you can set *banner*.

    var opts = require('tav').set({
        host: {
            note: 'Hostname'
        },
        port: {
            note: 'Binding port',
            value: 80
        },
        debug : {
            note : 'Debug this',
            value : false
        }
    }, "Very cool app");
    console.log(opts);

If you omit the option "port", it will be set by default value:

    $node app.js --host=localhost --debug arg1 arg2
    { host: 'localhost', port: 80, debug: true } [ 'arg1', 'arg2' ]

But still, how about the option `--help`? Let's do it.

    $node app.js --host=localhost --debug arg1 arg2 --help
    Very cool app

    Hostname
        --host *required
    Binding port
        --port
    Debug this
        --debug
    Help. This message.
        --help

`--help` option prints usage instructions and terminates program with normal
exit code (0).

## Required options

You probably noticed that `--host` option marked as `*required` in usage 
instructions . And if we run "Very cool app" without this option, you will get 
this such a bomb...

    $node app.js --debug arg1 arg2
    Very cool app
    
    Required but not provided:
        --host
    
    Run with --help for more info

Option is considered as `required` if specifications do not specify its 
default value. If required option not provided, `set` prints info about absent 
options and terminates program with error.

## Unexpected options

While our program is guzzled all that it will. Let's try a little bit to 
straighten it. This requires only small changes:

    var opts = require('../tav').set({
        host : {
            note : 'Hostname'
        },
        port : {
            note : 'Binding port',
            value : 80
        }                           // Remove "debug" from specifications
    }, "Very cool app",
    true);                          // And set "true" after banner
    console.log(opts);

Last parameter causes `set` to generate an error if in command line appears
option that not described in the specifications. Let's crash...

    $node app.js --host=localhost --debug arg1 arg2
    Very cool app
    
    Unexpected options:
        --debug
    
    Run with --help for more info
    
... and once more...

    $node app.js --debug arg1 arg2
    Very cool app
    
    Required but not provided:
        --host
    Unexpected options:
        --debug
    
    Run with --help for more info

## Globalization

`tav` stores all options and arguments on first call of `set` function. After
that all of them will be available from other modules without having to call
`set` as regular object. Let's try.

Our tortured *app.js*:

    var opts = require('tav').set({
        host: {
            note: 'Hostname'
        },
        port: {
            note: 'Binding port',
            value: 80
        },
        debug : {
            note : 'Debug this',
            value : false
        }
    }, "Very cool app");
    var nested = require('./nested');
    console.log(nested.report());

And *nested.js*:

    var opts = require('tav');
    exports.report = function() {
        return opts;
    };

Run it:

    $node app.js --host=localhost arg1 arg2
    { port: 80, debug: false, host: 'localhost' }
    
... All good. All in place.
    
    