"use strict";
var lyrics = require('./lyrics'),
    app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

var dbus;
var spotify
if(/^win/.test(process.platform) || /^darwin/.test(process.platform)) {
  spotify = require('@jonny/spotify-web-helper')();
} else {
   dbus = require('dbus');
}

var current = {};
var last = {
  track: {
    artist_resource: {
      name: null
    },
    track_resource: {
      name: null
    },
    album_resource: {
      name: null
    }
  }
};

var areEqualTracks = (track1, track2) => (track1.track.artist_resource.name === track2.track.artist_resource.name &&
  track1.track.track_resource.name === track2.track.track_resource.name &&
  track1.track.album_resource.name === track2.track.album_resource.name);

var updateCurrent = function(status) {
  if(!areEqualTracks(last, status)) {
    last = status;
    lyrics(status).then(function(data) {
      current = data;
      if(sockets)
        for(var s in sockets)
          sockets[s].emit('track', current);
    });
  }
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


if(/^win/.test(process.platform) || /^darwin/.test(process.platform)) {
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
} else {
  var bus = new dbus();
  var sessionBus = bus.getBus('session')
  sessionBus.getInterface('org.mpris.MediaPlayer2.spotify', '/org/mpris/MediaPlayer2', 'org.freedesktop.DBus.Properties', function(err, iface){
    if(err) return console.log(err);
    iface.on('PropertiesChanged', function(name, data) {
      updateCurrent({
        track: {
          artist_resource: {
            name: data.Metadata['xesam:artist'][0]
          },
          track_resource: {
            name: data.Metadata['xesam:title']
          },
          album_resource: {
            name: data.Metadata['xesam:album']
          }
        }
      });
    });
  });
}
