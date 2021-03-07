const router = require("express").Router()
const h = require("../core/helpers")
let handlers = {}

/*
	Adding meta handler:
		create object with function "getAll" that takes a query string as a parameter.
		The function should return an array with objects containing at least properties title, description, rating, thumbnail.
		If for some reason you cannot provide required property leave it as something like "no title"
*/

router.get("/meta/:handler/:q", (req,res) => {
	if(!req.session.user) return res.status(h.http_codes.Forbidden).send("not logged in or not admin")
	if(!handlers[req.params.handler] || !handlers[req.params.handler].getAll) return res.status(h.http_codes.Not_Found).send("handler or action not found")
	Promise.resolve(handlers[req.params.handler].getAll(req.params.q))
	.then(t => {
		res.send(t)
	})
	.catch(err => {
		res.status(h.http_codes.Internal_error).send(err)
	})
})

router.get("/meta/handlers", (req,res) => {
	if(!req.session.user) return res.status(h.http_codes.Forbidden).send("not logged in or not admin")
	res.send(Object.keys(handlers))
})

const run = () => {
	process.armadillo.app.use(router)
}

module.exports = {
	run,
	handlers,
	enabled:true,
	loadorder:2,
	meta: {
		name:"meta API",
		description:"manages uniform meta fetching with handlers",
		version:[1,0,0],
		github:"https://github.com/ffamilyfriendly/Armadillo/blob/master/modules/core/meta.module.js"
	}
}