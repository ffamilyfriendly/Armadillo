const router = require("express").Router()
const request = require("request")
const puppeteer = require('puppeteer');
const ws = require("ws")
const server = new ws.Server({ noServer: true })
const { http_codes } = require("../core/helpers");

const apiUrl = "https://nyafilmer.app"

//https://nyafilmer.vip/list/test/
router.get("/nyafilmer", (req,res) => {
	if(!req.session.user) return res.redirect("/")
	if(!req.query.q) return res.status(400).send("no query")

	request(`${apiUrl}/ajax_list/${req.query.q}`, {timeout:2000},(err, result, body) => {
		if(err) return res.status(http_codes.Internal_error).send(err)
		res.send(body)
	})
})

router.get("/nyafilmer/scrape",(req,res) => {
	if(!req.session.user) return res.redirect("/")
	if(!req.query.u) return res.status(400).send("no query")

	request(`${apiUrl}/${req.query.u}`, {timeout:2000},(err, result, body) => {
		if(err) return res.status(http_codes.Internal_error).send(err)
		res.send(body)
	})
}) 


/* 	Due to puppeteer taking a few seconds to
*	process the request server might die
*	if many requests are made at the same time,
*	my solution to this is a queue system
*/
let queue = []
server.on("connection", socket => {
	socket.on("message", msg => {
		try {
			const data = JSON.parse(msg)

			switch(data.type) {
				case "add":
					if(queue.filter(qi => qi.user == data.user).length > 0) return socket.send(JSON.stringify({type:"error",data:"you have already queued a link"}))
					queue.push({user:data.user,url:data.data,socket})
					if(queue.length == 1) doScrape()
					socket.send(JSON.stringify({type:"OK",data:queue.length}))
				break;
				case "remove":
					queue = queue.filter(qi => qi.user != data.user)
					socket.send(JSON.stringify({type:"OK",data:queue.length}))
				break;
				default:
					socket.send(JSON.stringify({type:"error",data:"what do you want? add <link> or remove"}))
				break;
			}

		} catch(err) {
			socket.send(JSON.stringify({type:"error",data:"could not parse request"}))
		}
	})
})



const doScrape = async () => {
	const s = queue[0]
	if(!s) return
	try {
		const browser = await puppeteer.launch()
		const page = await browser.newPage()
		await page.emulate(puppeteer.devices["iPad"])
		await page.setViewport({ width: 1920, height: 1080 });
		await page.goto(`${apiUrl}/${s.url}`);
		await page.waitForSelector("#postContent > iframe")
	
		const data = await page.evaluate(() => document.querySelector('#postContent > iframe').getAttribute("src"))
		await page.close()
		browser.close()
		s.socket.send(JSON.stringify({type:"DONE",data:data}))
	} catch(err) {
		console.error(err)
		s.socket.send(JSON.stringify({type:"error",data:err}))
	}

	queue.shift()
	server.clients.forEach(c => c.send(JSON.stringify({type:"QUPDATE",data:queue})))
	return doScrape()
}

const run = () => {
	module.exports.apiUrl = apiUrl
	process.armadillo.app.use(router)
	process.armadillo.app.server.on('upgrade', (request, socket, head) => {
		server.handleUpgrade(request, socket, head, socket => {
		  server.emit('connection', socket, request);
		});
	})
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