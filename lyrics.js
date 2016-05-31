"use strict";
var azlyrics = require('./parse-az-lyrics');

exports = module.exports = function(status) {
  let info = (status => status ? {
    artist: status.track.artist_resource.name,
    title: status.track.track_resource.name,
    album: status.track.album_resource.name
  } : null)(status);
  return info ? azlyrics(info) : null;
}
