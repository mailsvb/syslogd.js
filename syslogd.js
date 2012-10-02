var config = {
	end:"\n",
	folder:__dirname,
	port: 1514
}

var dgram = require("dgram");
var fs = require('fs');

var server4 = dgram.createSocket("udp4");
var server6 = dgram.createSocket("udp6");

server4.on("message", function (msg, rinfo) {
	
	// create folder
	if (!fs.existsSync(config.folder + "\\" + rinfo.address)) {
		fs.mkdirSync(config.folder + "\\" + rinfo.address);
	}
	
	// write message
	fs.appendFileSync(config.folder + "\\" + rinfo.address + "\\" + rinfo.address + "_" + formatDate() + ".txt", msg + config.end);
});

server6.on("message", function (msg, rinfo) {
	// replace : in IPv6 address
	var ip = rinfo.address.replace(/:/g, ".");
	
	// create folder
	if (!fs.existsSync(config.folder + "\\" + ip)) {
		fs.mkdirSync(config.folder + "\\" + ip);
	}
	
	// write message
	fs.appendFileSync(config.folder + "\\" + ip + "\\" + ip + "_" + formatDate() + ".txt", msg + config.end);
});

var formatDate = function(date) {
  var now = date || (new Date());
	var YY = now.getFullYear();
	var MM = (now.getMonth() + 1);
		if (MM < 10) { MM = '0' + MM; }
	var DD = now.getDate();
		if (DD < 10) { DD = '0' + DD; }
	return YY + "_" + MM + "_" + DD;
}

server4.on("listening", function () {
  var address = server4.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});

server6.on("listening", function () {
  var address = server6.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});

var socketErrorHandler = function(exception) {
  console.error("A Socketerror occured!");
  if (config.port < 1024) {
    console.warn('Your port ist set lower than 1024, maybe you are not privileged to use it.');
  }
  console.warn(exception);
};

server4.on('error', socketErrorHandler);
server6.on('error', socketErrorHandler);

server4.bind(config.port);
server6.bind(config.port);
