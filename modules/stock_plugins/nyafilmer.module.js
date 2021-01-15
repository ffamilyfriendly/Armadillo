const router = require("express").Router()
const request = require("request")
const puppeteer = require('puppeteer');
const { http_codes } = require("../core/helpers");

//https://nyafilmer.vip/list/test/
router.get("/nyafilmer", (req,res) => {
	if(!req.session.user) return res.redirect("/")
	if(!req.query.q) return res.status(400).send("no query")

	request(`https://nyafilmer.vip/ajax_list/${req.query.q}`,(err, result, body) => {
		if(err) return res.status(h.http_codes.Internal_error).send(err)
		res.send(body)
	})
})

router.get("/nyafilmer/scrape",(req,res) => {
	if(!req.session.user) return res.redirect("/")
	if(!req.query.u) return res.status(400).send("no query")

	request(`https://nyafilmer.vip/${req.query.u}`,(err, result, body) => {
		if(err) return res.status(h.http_codes.Internal_error).send(err)
		res.send(body)
	})
})

/*
Nyafilmer has obfuscated their code (cringe). I will run it in a browser and get its output
(this is ram heavy and will maybe not run anywhere but it works)
*/
router.get("/nyafilmer/resolveurl", async (req,res) => {
	if(!req.session.user) return res.redirect("/")
	if(!req.query.u) return res.status(400).send("no query")

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.emulate(puppeteer.devices["iPad"])
	await page.setViewport({ width: 1920, height: 1080 });

	await page.goto(`https://nyafilmer.vip${req.query.u}`);
	await page.waitForSelector("#postContent > iframe")
	.catch(err => {
		console.err(err)
		return res.status(http_codes.Internal_error).send("could not fetch media")
	})
	const data = await page.evaluate(() => document.querySelector('#postContent > iframe').getAttribute("src"));
	page.close()

	res.send(data)
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
		description:"scrapes nya filmer for films (experimental)",
		version:[1,0,0],
		github:"https://github.com/ffamilyfriendly/Armadillo/blob/master/modules/stock_plugins/pluginList.module.js"
	}
}