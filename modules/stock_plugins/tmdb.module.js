const h = require("../core/helpers")
const metaModule = require("../core/meta.module.js")
const fs = require("fs")
const request = require("request")
let apiKey = ""

let handler = {}

const paseItems = (items) => {
	items = items.results
	return items.map(item => {
		return {
			id: item.id,
			title: item.title || item.original_name || "no title",
			description: item.overview || "no description",
			rating: item.vote_average || 0,
			thumbnail: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : ""
		}
	})
}

handler.getAll = (query) => {
	return new Promise((reject,resolve) => {
		const qUrl = `https://api.themoviedb.org/3/search/multi?query=${query}&api_key=${apiKey}`
		request(qUrl,(err, result, body) => {
			if(err) return reject(err)
			else resolve(paseItems(JSON.parse(body)))
		})
	})
}

const run = () => {
	try {
		apiKey = fs.readFileSync("./modules/stock_plugins/api.key")
	} catch(err) {
		console.log("got error in metadata plugin reading api key. Are you sure a file called \"api.key\" exists in same dir?")
	}
	metaModule.handlers["tmdb"] = handler
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