"use strict";
var lyrics = require('./lyrics');
var spotify = require('@jonny/spotify-web-helper')();
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  lyrics(spotify.status).then(data => res.send(
    `<html>
      <body>
        <h2>${data.artist} - ${data.title}</h2>
        <div>
          <pre>${data.lyrics}</pre>
        </div>
      </body>
    </html>`),
    res.send
  );
});

app.listen(8000, () => spotify.player.on('ready', console.log.bind(this, 'Express server listening to port 8000.')));
