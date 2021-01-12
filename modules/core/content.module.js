const router = require("express").Router()
const path = require("path")

router.get("/browse/:id", (req,res) => {
	if(!req.session.user) return res.redirect("/")
	const id = req.params.id
	res.render("browse", {me:req.session.user, id})
})

router.get("/search", (req,res) => {
	res.sendFile(path.join(__dirname,"../../front/search.html"))
})

router.get("/:id/new", (req,res) => {
	if(!req.session.user || !req.session.user.admin) return res.redirect("/")
	const id = req.body.id
	res.render("new", {parent:id})
})

const run = () => {
	process.armadillo.app.use(router)
}

module.exports = {
	run,
	enabled:true,
	loadorder:1,
	meta: {
		name:"content",
		description:"Main router for content requests. This is a core plugin and disabling it would likely lead to armadillo not functioning",
		version:[1,0,0],
		github:"https://github.com/ffamilyfriendly/Armadillo/blob/master/modules/core/pages.module.js"
	}
}