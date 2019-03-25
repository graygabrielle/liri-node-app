


//Liri takes the following arguments
// * `concert-this`

// * `spotify-this-song`

// * `movie-this`

// * `do-what-it-says`

//these add other programs to this one
require("dotenv").config();
const axios = require('axios');
const apiKeys = require("./keys.js");
const fs = require('fs'); //file system
const Spotify = require('node-spotify-api');
const request = require('request');
const inquirer = require('inquirer');
const moment = require('moment');


const space = "\n" + "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
const header = "================= Extraordinary Liri found this ...==================";


// Function that writes all the data from output to the logfile
function writeToLog(data) {
    fs.appendFile("log.txt", '\r\n\r\n', function(err) {
        if (err) {
            return console.log(err);
        }
    });

    fs.appendFile("log.txt", (data), function(err) {
        if (err) {
            return console.log(err);
        }
        console.log(space + "log.txt was updated!");
    });
}


// =================================================================
// Spotify function, Spotify api
function getMeSpotify(songName) {
    let spotify = new Spotify(apiKeys.spotify);
    // If there is no song name, set the song to Blink 182's What's my age again
    if (!songName) {
        songName = "What's my age again";
    }
    spotify.search({ type: 'track', query: songName }, function(err, data) {
        if (err) {
            console.log('Error occurred: ' + err);
            return;
        } else {
            output =
                "================= LIRI FOUND THIS FOR YOU...==================" +
                space + "Song Name: " + "'" + songName.toUpperCase() + "'" +
                space + "Album Name: " + data.tracks.items[0].album.name +
                space + "Artist Name: " + data.tracks.items[0].album.artists[0].name +
                space + "URL: " + data.tracks.items[0].album.external_urls.spotify;
            console.log(output);
            writeToLog(output);
        }
    });

}

let getMeMovie = function(movieName) {

    if (!movieName) {
        movieName = "Mr Nobody";
    }
    //Get your OMDb API key creds here http://www.omdbapi.com/apikey.aspx
    // t = movietitle, y = year, plot is short, then the API key
    let urlHit = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

    request(urlHit, function(err, res, body) {
        if (err) {
            console.log('Error occurred: ' + err);
            return;
        } else {
            let jsonData = JSON.parse(body);
            output = space + header +
                space + 'Title: ' + jsonData.Title +
                space + 'Year: ' + jsonData.Year +
                space + 'Rated: ' + jsonData.Rated +
                space + 'IMDB Rating: ' + jsonData.imdbRating +
                space + 'Country: ' + jsonData.Country +
                space + 'Language: ' + jsonData.Language +
                space + 'Plot: ' + jsonData.Plot +
                space + 'Actors: ' + jsonData.Actors +
                space + 'Tomato Rating: ' + jsonData.Ratings[1].Value +
                space + 'IMDb Rating: ' + jsonData.imdbRating + "\n";

            console.log(output);
            writeToLog(output);
        }
    });
};

const getMeConcert = function(artistName) {
    if (!artistName) {
        artistName = "Local Natives";
    }

    const url = "https://rest.bandsintown.com/artists/" + artistName + "/events?app_id=codingbootcamp"

    axios.get(url)
        .then(function(response){
            
            const concert = response.data[0];
            let dateTime = new Date(concert.datetime);
            console.log(dateTime);
            dateTime = moment(dateTime).format("MM-DD-YYYY hh:mm");
            const output = header +
            space + "Concert date and time: " + dateTime +
            space + "Venue name: " + concert.venue.name +
            space + "Venue location: " + concert.venue.city + ", " + concert.venue.country

            console.log(output);
            writeToLog(output);
        })
        
        .catch(function(err){
            if(err){
                console.log("Sorry, there are no upcoming concerts for this band.")
            }
        })

}

function doWhatItSays() {
    // Reads the random text file and passes it to the spotify function
    fs.readFile("random.txt", "utf8", function(error, data) {
        getMeSpotify(data);
    });
}

const questions = [{
        type: 'list',
        name: 'programs',
        message: 'What would you like to do?',
        choices: ['Look up a song', 'Look up a movie', 'Find a concert', 'Look up something random']
    },
    {
        type: 'input',
        name: 'movieChoice',
        message: 'What movie would you like to look up?',
        when: function(answers) {
            return answers.programs == 'Look up a movie';
        }
    },
    {
        type: 'input',
        name: 'artistName',
        message: 'What artist do you want to see in concert?',
        when: function(answers) {
            return answers.programs == 'Find a concert';
        }
    },
    {
        type: 'input',
        name: 'songChoice',
        message: 'What song would you like to look up?',
        when: function(answers) {
            return answers.programs == 'Look up a song';
        }
    }
];

const questions2 = [
    {
        type: 'list',
        name: 'whatNext',
        message: 'What would you like to do next?',
        choices: ['Do something else...', 'Quit']
    }
]

inquirer
    .prompt(questions)
    .then(answers => {
        // Depending on which program the user chose to run it will do the function for that program
        switch (answers.programs) {
            case 'Look up a song':
                getMeSpotify(answers.songChoice);
                break;
            case 'Look up a movie':
                getMeMovie(answers.movieChoice);
                break;
            case 'Find a concert':
                getMeConcert(answers.artistName);
                break;
            case 'Look up something random':
                doWhatItSays();
                break;
            default:
                console.log('LIRI doesn\'t know how to do that');
        }
    });
function whatNext(){
    inquirer
    .prompt(questions2)
    .then(answers => {
        // Depending on which program the user chose to run it will do the function for that program
        switch (answers.) {
            case 'Look up a song':
                getMeSpotify(answers.songChoice);
                break;
            case 'Look up a movie':
                getMeMovie(answers.movieChoice);
                break;
            case 'Find a concert':
                getMeConcert(answers.artistName);
                break;
            case 'Look up something random':
                doWhatItSays();
                break;
            default:
                console.log('LIRI doesn\'t know that');
        }
    });
}
   