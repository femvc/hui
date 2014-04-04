var port = 2050;
console.log('Server is running at ' + port + '.');
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: port});
wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log('received: %s', message);
        ws.send(message + 'to myself');
        wss.broadcast(message + 'to others');
    });
    ws.send('Server is ready.');
});

wss.broadcast = function(data) {
    for(var i in this.clients)
        this.clients[i].send(data);
};
/*
var Server = require('ws').Server;
var app = new Server({port:8443});
var sockets = {};
app.on('connection', function(ws) {
	var id = Math.random()*10000 + '' + new Date().getTime();
	sockets[id] = ws;
	var filename = '';
	ws.on('message', function(data, flags) {
		for(var i in sockets) {
			if(i !== id) {
				sockets[i].send(data, {binary:flags.binary, mask:false});
			}
		}
	});
});
*/