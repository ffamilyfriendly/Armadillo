const express = require("express"),
	app = express(),
	cs = require("express-session"),
	store = new cs.MemoryStore(),
	getFiles = require("./lib/filelist"),
	bodyParser = require("body-parser")
	process.armadillo = { config:require("./config"), plugins:[], permissions:{}}



app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/favicon.ico",(req,res) => {
	res.sendFile(require("path").join(__dirname,"favicon.ico"))
})

app.use(cs({
    secret: process.armadillo.config.cookie_secret,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
}))
app.use("/static", express.static("front"))
app.set('view engine', 'ejs');
app.set("views",require("path").join(__dirname,"./front/views"))

process.armadillo.app = app
process.armadillo.app.server = app.listen(process.armadillo.config.port, () => console.log(`Listening on port ${process.armadillo.config.port}`))
module.exports = { store}
getFiles("./modules").filter(m => m.endsWith(".module.js")).map(m => require(m)).sort((a,b) => a.loadorder - b.loadorder).forEach(_M => {_M.enabled ? _M.run() : null; process.armadillo.plugins.push(_M)})
