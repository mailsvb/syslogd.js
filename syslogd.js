/* * * *
	Config
 * * * */

var config = {
	end:"\n",
	folder:__dirname,
	port: 514
}

var dgram = require("dgram");
var fs = require('fs');
var util = require('util');
fileStreams = new Array();


/* * * *
	binding sockets
 * * * */

var server4 = dgram.createSocket("udp4");
var server6 = dgram.createSocket("udp6");

[server4, server6].map(function(socket) {
	socket.on('listening', function() {
		var addressInfo = this.address();
		console.log("server listening " + addressInfo.address + ":" + addressInfo.port);
	});
	socket.on('error', socketErrorHandler);
	socket.on('message', socketMessageHandler);
	socket.bind(config.port);
});


/* * * *
	callback functions
 * * * */

var socketMessageHandler = function(msg, rinfo) {
	// replace : in IPv6 addresses
	var ip = rinfo.address.replace(/:/g, ".");
	
	// create folder IP based if it does not exist
	if (!fs.existsSync(config.folder + "\\" + ip)) {
		fs.mkdirSync(config.folder + "\\" + ip);
	}
	
	var now 		= getDate();
	var filename 	= util.format('%s\\%s\\%s_%s.txt', config.folder, ip, ip, now);
	
	try {
		if (!fileStreams[ip]) {
			fileStreams[ip] = {	date : now, stream: fs.createWriteStream(filename, {'flags' : 'a'})};
			fileStreams[ip].stream.setMaxListeners(0);
		}
		
		if (fileStreams[ip].date != now) {
			fileStreams[ip].stream.destroySoon();
			fileStreams[ip] = {	date : now, stream: fs.createWriteStream(filename, {'flags' : 'a'})};
			fileStreams[ip].stream.setMaxListeners(0);
		}
	}
	catch(error) {
		console.error(error);
	}
	
	fileStreams[ip].stream.on('error', function(error) {
		console.error('error on stream write', error, this);
	});
		
	// writing log message to stream
	fileStreams[ip].stream.write(msg + config.end);
};

var socketErrorHandler = function(exception) {
	console.error("A Socketerror occured!");
	if (config.port < 1024) {
		console.warn('Your port ist set lower than 1024, maybe you are not privileged to use it.');
	}
	console.warn(exception);
};


/* * * *
	general functions
 * * * */

var getDate = function(date) {
	var now = date || (new Date());
	var YY = now.getFullYear();
	var MM = (now.getMonth() + 1);
		if (MM < 10) { MM = '0' + MM; }
	var DD = now.getDate();
		if (DD < 10) { DD = '0' + DD; }
	return YY + "_" + MM + "_" + DD;
}