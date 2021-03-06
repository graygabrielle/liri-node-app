
require("dotenv").config();
const axios = require('axios');
const apiKeys = require("./keys.js");
const fs = require('fs'); //file system
const Spotify = require('node-spotify-api');
const request = require('request');
const inquirer = require('inquirer');
const moment = require('moment');
const space = "\n" + "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
const header = "================= LIRI FOUND THIS FOR YOU...==================";


//===================== writes returned data to the log file======================
function writeToLog(data) {

    fs.appendFile("log.txt", data, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log(space + "log.txt was updated!" + "\n");
        whatIsNext();
    });
}


// ========================Spotify function, Spotify api==========================
function getMeSpotify(songName) {
    let spotify = new Spotify(apiKeys.spotify);

    if (!songName) {
        songName = "Say my name";
    }
    spotify.search({ type: 'track', query: songName }, function(err, data) {
        if (err) {
            console.log('Error occurred: ' + err);
            whatIsNext();
        } 
        else {
            const song = data.tracks.items[0];
            output =
                space + header +
                space + "Song Name: " + song.name +
                space + "Album Name: " + song.album.name +
                space + "Artist Name: " + song.artists[0].name +
                space + "URL: " + song.album.external_urls.spotify +
                "\n";

            console.log(output);
            writeToLog(output);
        }
    });

}


//===============================OMDB API, movie funciton=======================
let getMeMovie = function(movieName) {

    if (!movieName) {
        movieName = "Home Alone";
    }
  
    const url = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

    request(url, function(err, res, body) {
        if (err) {
            console.log('Error occurred: ' + err);
            whatIsNext();
        }; 
        if (!res || !body) {
            console.log('We couldn\'t find the movie you requested. Try another one.');
            whatIsNext();
        }
        else {
            let jsonData = JSON.parse(body);
            const output = 
            space + header +
            space + 'Title: ' + jsonData.Title +
            space + 'Year: ' + jsonData.Year +
            space + 'Rated: ' + jsonData.Rated +
            space + 'Country: ' + jsonData.Country +
            space + 'Language: ' + jsonData.Language +
            space + 'Plot: ' + jsonData.Plot +
            space + 'Actors: ' + jsonData.Actors +
            space + 'Rotten Tomatoes Rating: ' + jsonData.Ratings[1].Value +
            space + 'IMDB Rating: ' + jsonData.imdbRating +
            "\n";

            console.log(output);
            writeToLog(output);
        }
    });
};


//========================Bands in town API, get concert function=======================
const getMeConcert = function(artistName) {
    if (!artistName) {
        artistName = "Local Natives";
    }

    const url = "https://rest.bandsintown.com/artists/" + artistName + "/events?app_id=codingbootcamp"

    axios.get(url)
        .then(function(response){
            
            const concert = response.data[0];
            let dateTime = new Date(concert.datetime);
            dateTime = moment(dateTime).format("MM-DD-YYYY hh:mm a");
            const output = 
            space + header +
            space + "Artist: " + concert.lineup[0] +
            space + "Soonest concert date and time: " + dateTime +
            space + "Venue name: " + concert.venue.name +
            space + "Venue location: " + concert.venue.city + ", " + concert.venue.country +
            "\n";

            console.log(output);
            writeToLog(output);
        })
        
        .catch(function(err){
            if(err){
                console.log(space + "Sorry, there are no upcoming concerts for this band." + "\n")
                whatIsNext();
            }
        })

}


//=============Reads from random.txt to return something "random"================
function doWhatItSays() {
    // Reads the random text file and passes it to the spotify function
    fs.readFile("random.txt", "utf8", function(error, data) {
        if(error){
            console.log(error);
            whatIsNext();

        }
        getMeSpotify(data);
    });
}


//==========================first prompt to user============================
function startPrompt(){

    const questions = 
    [{
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
    }];

    inquirer
    .prompt(questions)
    .then(answers => {

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
}


//======after results are returned to user, asks what they want to do next========
function whatIsNext(){

    inquirer
    .prompt([{
        type: 'list',
        name: 'whatNext',
        message: 'What would you like to do next?',
        choices: ['Quit', 'Do something else']
    }])
    .then(answer => {

        if (answer.whatNext === 'Quit'){
            process.exit();
        }
        else {
            startPrompt();
        }
    });
};

//=========runs the function to start the inquirer for initial user prompt=======
startPrompt();