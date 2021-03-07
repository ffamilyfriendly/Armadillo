const h = require("../core/helpers")
const request = require("request")
const metaModule = require("../core/meta.module.js")
const api = "https://www.storytel.com/api/search.action?q="

let handler = {}

const parseBooks = (books) => {
	return books.books.map(book => {
		return {
			id: book.book.AId,
			title: book.book.name || "no title",
			description: book.abook ? book.abook.description : book.ebook ? book.ebook.description : "no description",
			rating: (book.book.grade * 2) || 0,
			thumbnail: `https://storytel.com${book.book.cover}` || ""
		}
	})
}

handler.getAll = (query) => {
	return new Promise((reject,resolve) => {
		request(`${api}${query}`,(err, result, body) => {
			if(err) reject(err)
			else resolve(parseBooks(JSON.parse(body)))
		})
	})
}

const run = () => {	
	metaModule.handlers["storytel"] = handler
}

module.exports = {
	run,
	enabled:true,
	loadorder:100,
	meta: {
		name:"storytel meta grabber",
		description:"grabs meta from storytel.com",
		version:[1,0,0],
		github:"https://github.com/ffamilyfriendly/Armadillo/blob/master/modules/stock_plugins/storytel.module.js"
	}
}