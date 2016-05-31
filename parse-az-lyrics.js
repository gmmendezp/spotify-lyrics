"use strict";
var request = require('request');
var cheerio = require('cheerio');


var base = 'http://www.azlyrics.com/';
var notFound = 'Error: Song not found.';

var cleanTitleUrl = url => {
  let clean = /(\.\.\/)+(.*)/i.exec(url);
  return clean ? clean[2] : null;
};
var cleanBandName = name => {
  let clean = /the (.*)/i.exec(name);
  return clean ? clean[1] : null;
};
var cleanTitle = title => {
  let clean = /([a-z0-9&\s',.]+[a-z0-9&',.]).*/i.exec(title);
  return clean ? clean[1] : null;
};
var getLetter = artist => /[0-9]/.exec(artist.slice(0,1)) ? '19' : artist[0].toLowerCase();
var capitalize = s => s.replace(/(?:^|\s)\S/g, a => a.toUpperCase());

var findArtistUrl = function(artist) {
  return new Promise(function(resolve, reject) {
    if (!artist) return reject(notFound);
    let url = `${base}${getLetter(artist)}.html`;
    request(url, function(error, response, html) {
      if(error) reject(error);
      let $ = cheerio.load(html);
      let artistUrl = $(`a:contains('${artist.toUpperCase()}')`).attr('href');
      return artistUrl ? resolve(artistUrl) : reject(notFound);
    });
  });
};

var findSong = function(title, artistUrl) {
  return new Promise(function(resolve, reject) {
    if (!title) return reject(notFound);
    let url = `${base}${artistUrl}`;
    request(url, function(error, response, html) {
      if(error) reject(error);
      let $ = cheerio.load(html);
      let titleUrl = $(`a:contains('${capitalize(title)}')`).attr('href');
      return titleUrl ? resolve(titleUrl) : reject(notFound);
    });
  });
};

var findLyrics = function(songUrl) {
  songUrl = cleanTitleUrl(songUrl)
  return new Promise(function(resolve, reject) {
    if (!songUrl) return reject(notFound);
    let url = `${base}${songUrl}`;
    request(url, function(error, response, html) {
      if(error) reject(error);
      let $ = cheerio.load(html);
      let lyrics = $('div').filter(function() {
        return !Object.keys(this.attribs).length && $(this).text();
      }).text();
      return lyrics ? resolve(lyrics.trim()) : reject(notFound);
    });
  });
};

exports = module.exports = function(info) {
  return findArtistUrl(info.artist).catch(
    findArtistUrl.bind(this, cleanBandName(info.artist))
  ).then(artistUrl => findSong(info.title, artistUrl).catch(
      () => findSong(cleanTitle(info.title), artistUrl)
    )
  ).then(findLyrics).then(
    lyrics => Object.assign({lyrics}, info),
    lyrics => Object.assign({lyrics}, info)
  );
}
