const router = require("express").Router()
const h = require("../core/helpers")
const fs = require("fs")
const request = require("request")

let apiKey = ""

router.get("/meta/search", (req,res) => {
	const query = req.query.q
	if(!req.session.user || !req.session.user.admin) res.status(h.http_codes.Forbidden).send("not logged in or not admin")
	if(!query) res.status(h.http_codes.Bad_Request).send("no query")
	const qUrl = `https://api.themoviedb.org/3/search/multi?query=${query}&api_key=${apiKey}`
	request(qUrl,(err, result, body) => {
		if(err) return res.status(h.http_codes.Internal_error).send(err)
		else res.send(body)
	})
})

const run = () => {
	try {
		apiKey = fs.readFileSync("./modules/stock_plugins/api.key")
	} catch(err) {
		console.log("got error in metadata plugin reading api key. Are you sure a file called \"api.key\" exists in same dir?")
	}
	
	process.armadillo.app.use(router)
}

module.exports = {
	run,
	enabled:true,
	loadorder:100,
	meta: {
		name:"themoviedb meta grabber",
		description:"grabs meta from the movie db (requires API key)",
		version:[1,0,0],
		github:"https://github.com/ffamilyfriendly/Armadillo/blob/master/modules/stock_plugins/tmdb.module.js"
	}
}