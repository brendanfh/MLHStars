const express = require("express")
const fs = require("fs")
const movie_info = require("./movie_info")

const app = express()

//Setup middleware

function staticFolder(route, folder) {
    let router = new express.Router()
    router.use(express.static(folder))
    app.use(route, router)
}

app.get("/", (req, res) => {
    fs.readFile("www/index.html", (err, data) => {
        if (err) {
            res.status(500)
            res.write("Failed to load page.")
            res.end()
            return
        }

        res.status(200)
        res.write(data)
        res.end()
    })
})

app.get("/api/get_movies_from_actor", (req, res) => {
    let actor_id = req.query.id
    let layer = req.query.layer

    movie_info.getMoviesByActor(actor_id, layer).then((movies) => {
        res.json(movies)
        res.end()
    })
})

app.get("/api/get_actors_from_movie", (req, res) => {
    let movie_id = req.query.id
    let layer = req.query.layer

    movie_info.getActorsByMovie(movie_id, layer).then((actors) => {
        res.json(actors)
        res.end()
    })
})

app.get("/api/get_movie_id", (req, res) => {
    let name = req.query.name;
    name = name.replace(" ", "%20");

    movie_info.getMovieIDByName(name).then((actor_id) => {
        res.json({ id: actor_id })
        res.end()
    })
})

app.get("/api/get_actor_id", (req, res) => {
    let name = req.query.name;
    name = name.replace(" ", "%20");

    movie_info.getActorIDByName(name).then((actor_id) => {
        res.json({ id: actor_id })
        res.end()
    })
})


staticFolder("/static/", "www/static")

let PORT = process.env.PORT || 8080
let server = app.listen(PORT, () => {
    console.log("SERVER STARTED")
})