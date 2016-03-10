// Example showing us how the framework creates an environment (sandbox) for
// appication runtime, load an application code and passes a sandbox into app
// as a global context and receives exported application interface

// The framework can require core libraries
var fs = require('fs'),
    vm = require('vm'),
    util = require('util');

// Read an application source code from the file
var appNames = process.argv.slice(2);
if (appNames.length) {
	appNames.forEach(function(appName) {
		runApp(appName);
	});
} else {
	runApp('application.js');
}

function runApp(fileName) {
	// Create a hash and turn it into the sandboxed context which will be
	// the global context of an application
	var context = { 
		module: {},
		setTimeout: setTimeout,
		util: util,
		require: require
	};
	context.global = context;
	// Copy console to context
	addConsoleDeep(context);
	// Change log function
    context.console.log = function() {
     	var date = new Date();
	  	var monthes = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
	  				   'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
	  	var dateString = util.format('%d%s%d:%d:%d:%d', date.getDate()
	  												  , monthes[date.getMonth()]
	  												  , date.getFullYear()
	  												  , date.getHours()
	  												  , date.getMinutes()
	  												  , date.getSeconds());
	  	[].unshift.call(arguments, fileName, dateString);
	  	console.log.apply(context.console, arguments);
	}
	
	fs.readFile(fileName, function(err, src) {
	  // We need to handle errors here
	  
	  // Run an application in sandboxed context
	  var sandbox = createSandbox(context);
	  var script = vm.createScript(src, fileName);
	  script.runInNewContext(sandbox);
	  // We can access a link to exported interface from sandbox.module.exports
	  // to execute, save to the cache, print to console, etc.
	});
}

function createSandbox(context) {
	return vm.createContext(context);
}

function addConsoleDeep(context) {
	context.console = {};
	for (var prop in console) {
		context.console[prop] = console[prop];
	}
}