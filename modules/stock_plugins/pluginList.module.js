const router = require("express").Router()

router.get("/plugins", (req,res) => {
	res.render("pluginList", { plugins: process.armadillo.plugins})
})

const run = () => {
	process.armadillo.app.use(router)
}

module.exports = {
	run,
	enabled:true,
	loadorder:100,
	meta: {
		name:"plugin list",
		description:"lists all enabled plugins and their metadata",
		version:[1,0,0],
		github:"https://github.com/ffamilyfriendly/Armadillo/blob/master/modules/stock_plugins/pluginList.module.js"
	}
}