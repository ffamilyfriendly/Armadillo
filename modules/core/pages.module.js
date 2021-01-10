const router = require("express").Router()

router.get("/", (req,res) => {
	if(!req.session || !req.session.user) res.redirect("/login")
	else res.redirect("/browse/root")
})

const run = () => {
	process.armadillo.app.use(router)
}

module.exports = {
	run,
	enabled:true,
	loadorder:1,
	meta: {
		name:"pages",
		description:"Main router for requests. This is a core plugin and disabling it would likely lead to armadillo not functioning",
		version:[1,0,0],
		github:"https://github.com/ffamilyfriendly/Armadillo/blob/master/modules/core/pages.module.js"
	}
}