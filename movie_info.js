const fs = require("fs")
const https = require("https")
const path = require("path")

function loadApiKey() {
    let contents = fs.readFileSync(path.resolve(process.cwd(), "./api.json"), { encoding: "utf8" })
    let data = JSON.parse(contents)
    if (data.api_key)
        return data.api_key
    else
        throw new Error("API KEY NOT FOUND")
}

const API_KEY = loadApiKey()
const BASE_REQUEST_URL = "api.themoviedb.org"

const url_gen = {
    credits_by_movie_id(movie_id) {
        return `/3/movie/${movie_id}/credits?api_key=${API_KEY}`
    },

    movie_by_person_id(person_id) {
        return `/3/person/${person_id}/movie_credits?api_key=${API_KEY}`
    },

    movie_id_by_name(movie_name) {
        return `/3/search/movie?api_key=${API_KEY}&language=en-US&query=${movie_name}&page=1&include_adult=true`
    },

    person_id_by_name(person_name) {
        return `/3/search/person?api_key=${API_KEY}&language=en-US&query=${person_name}&page=1&include_adult=true`
    }
}

function getNumberByLayer(layer)
{
    return 30 - layer * 3;
}

function getMovieIDByName(movie_name)
{
    var url = url_gen.movie_id_by_name(movie_name)
    var options = {
        "host": BASE_REQUEST_URL,
        "path": url,
        "port": 443,
        "method": "GET"
    };

    var movie_id;

    return new Promise((resolve, rej) => {
        var data = "";

        var req = https.request(options, function (res) {
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                data += chunk;
            });
        });

        req.on("error", function(err) {
            console.error(err);
        });

        req.on("close", function () {
            body = JSON.parse(data);

            movie_id = body.results[0].id;

            resolve(movie_id);
        });

        req.write("");
        req.end();
    });
}

function getActorIDByName(actor_name)
{
    var url = url_gen.person_id_by_name(actor_name)
    var options = {
        "host": BASE_REQUEST_URL,
        "path": url,
        "port": 443,
        "method": "GET"
    };

    var actor_id;

    return new Promise((resolve, rej) => {
        var data = "";

        var req = https.request(options, function (res) {
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                data += chunk;
            });
        });

        req.on("error", function(err) {
            console.error(err);
        });

        req.on("close", function () {
            body = JSON.parse(data);

            actor_id = body.results[0].id;
            console.log(actor_id);

            resolve(actor_id);
        });

        req.write("");
        req.end();
    });
}

function getMoviesByActor(actor_id, layer) {
    var num_movies = getNumberByLayer(layer);
    var url = url_gen.movie_by_person_id(actor_id)
    var options = {
        "host": BASE_REQUEST_URL,
        "path": url,
        "port": 443,
        "method": "GET"
    };

    var movies = [];

    return new Promise((resolve, rej) => {
        var data = "";

        var req = https.request(options, function (res) {
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                data += chunk;
            });
        });

        req.on("error", function(err) {
            console.error(err);
        });

        req.on("close", function () {
            body = JSON.parse(data);
            var i = 0
            for (var movie of body.cast)
            {
                if (i >= num_movies) break;
                movies.push({ id: movie.id, name: movie.title })
                i++
            }

            resolve(movies);
        });

        req.write("");
        req.end();
    });
}

function getActorsByMovie(movie_id, layer) {
    var num_actors = getNumberByLayer(layer);
    var url = url_gen.credits_by_movie_id(movie_id);
    var options = {
        "host": BASE_REQUEST_URL,
        "path": url,
        "port": 443,
        "method": "GET"
    };

    var actors = [];

    return new Promise((resolve, rej) => {
        var data = "";

        var req = https.request(options, function (res) {
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                data += chunk;
            });
        });

        req.on("error", function(err) {
            console.error(err);
        });

        req.on("close", function () {
            body = JSON.parse(data);
            var i = 0
            for (var actor of body.cast)
            {
                if (i >= num_actors) break;
                actors.push({ id: actor.id, name: actor.name })
                i++
            }

            resolve(actors);
        });

        req.write("");
        req.end();
    });
}

module.exports = {
    //Functions here,
    getMovieIDByName,
    getActorIDByName,
    getMoviesByActor,
    getActorsByMovie
}