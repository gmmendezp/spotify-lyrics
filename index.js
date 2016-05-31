"use strict";
var lyrics = require('./lyrics'),
    spotify = require('@jonny/spotify-web-helper')(),
    app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

var current = {};
var updateCurrent = function(status) {
  lyrics(status).then(function(data) {
    current = data;
    if(sockets)
      for(var s in sockets)
        sockets[s].emit('track', current);
  });
};

server.listen(8000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var sockets = {};
io.sockets.on('connection', function (socket) {
  sockets[socket.id] = socket;
  socket.emit('track', current);
  socket.on('disconnect', function() {
    delete sockets[socket.id]
  });
});

spotify.player.on('ready', function() {
  console.log('Express server listening to port 8000.');
  updateCurrent(spotify.status);
  spotify.player.on('play', function() {
    updateCurrent(spotify.status);
  });
  spotify.player.on('track-change', function(track) {
    updateCurrent({track});
  });
});
