//
// Config
//
var config = {
	end:"\n",
	folder:__dirname,
	port: 1514
}

var dgram = require("dgram");
var fs = require('fs');
var util = require('util');

//
// Prepare callbacks
//

var createOrAppendToFileSync = function(msg, rinfo, formattedIp) {
  if (typeof formattedIp === 'undefined' || formattedIp === null) {
    formattedIp = rinfo.address;
  }
  // create folder if it does not exist
	if (!fs.existsSync(config.folder + "\\" + formattedIp)) {
		fs.mkdirSync(config.folder + "\\" + formattedIp);
	}
	
	var filename = util.format('%s\\%s\\%s_%s.txt', config.folder, formattedIp, formattedIp, formatDate());
	
	fs.appendFileSync(filename, msg + config.end);
};

var formatDate = function(date) {
  var now = date || (new Date());
	var YY = now.getFullYear();
	var MM = (now.getMonth() + 1);
		if (MM < 10) { MM = '0' + MM; }
	var DD = now.getDate();
		if (DD < 10) { DD = '0' + DD; }
	return YY + "_" + MM + "_" + DD;
}

var socketListeningHandler = function() {
  var addressInfo = this.address();
  console.log("server listening " +
    addressInfo.address + ":" + addressInfo.port);
};

var socketErrorHandler = function(exception) {
  console.error("A Socketerror occured!");
  if (config.port < 1024) {
    console.warn('Your port ist set lower than 1024, maybe you are not privileged to use it.');
  }
  console.warn(exception);
};

//
// Start Sockets
//

var server4 = dgram.createSocket("udp4");
var server6 = dgram.createSocket("udp6");

server4.on("message", createOrAppendToFileSync);

server6.on("message", function (msg, rinfo) {
	var ip = rinfo.address.replace(/:/g, "."); // replace ':' in IPv6 address
	createOrAppendToFileSync(msg, rinfo, ip);
});

[server4, server6].map(function(socket) {
  socket.on('listening', socketListeningHandler);
  socket.on('error', socketErrorHandler);
  socket.bind(config.port);
});
