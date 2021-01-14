const router = require("express").Router()
const { fstat } = require("fs")
const request = require("request")

//https://nyafilmer.vip/list/test/
router.get("/nyafilmer",(req,res) => {
	if(!req.session.user) return res.redirect("/")
	if(!req.query.q) return res.status(400).send("no query")

	request(`https://nyafilmer.vip/ajax_list/${req.query.q}`,(err, result, body) => {
		if(err) return res.status(h.http_codes.Internal_error).send(err)
		res.send(body)
	})
})

// resolving the url will be quirky. They have obfuscated it it seems
router.get("/nyafilmer/resolveurl",(req,res) => {
	if(!req.session.user) return res.redirect("/")
	if(!req.query.u) return res.status(400).send("no query")

	request(`https://nyafilmer.vip${req.query.u}`,(err, result, body) => {
		if(err) return res.status(h.http_codes.Internal_error).send(err)
		res.send("ss")
	})
})

const run = () => {
	process.armadillo.app.use(router)
}

module.exports = {
	run,
	enabled:true,
	loadorder:100,
	meta: {
		name:"Nya filmer scraper",
		description:"scrapes nya filmer for films",
		version:[1,0,0],
		github:"https://github.com/ffamilyfriendly/Armadillo/blob/master/modules/stock_plugins/pluginList.module.js"
	}
}