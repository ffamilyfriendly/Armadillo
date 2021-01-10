const router = require("express").Router(),
	path = require("path"),
	{r_params} = require("./helpers"),
	db = require("./database.module").db,
	bcrypt = require("bcrypt"),
	User = require("./user")


const generateUser = (username,passwords,perms) => {
	bcrypt.genSalt(10, (err,salt) => {
		bcrypt.hash(passwords,salt, (err, hash) => {
			db.run(`INSERT INTO users VALUES(?,?,?,?)`, [username,hash,Date.now(),Date.now()],(err) => {
				if(!err) {
					perms.forEach(p => {
						db.run(`INSERT INTO simpleValues VALUES("${p}","${username}","permission","true")`)
					})
				} else console.error(err)
			})
		})
	})
}

const checkInit = () => {
	db.all("SELECT * FROM USERS WHERE id=\"admin\"",(err,data) => {
		if(!data[0]) {
			const password = Buffer.from(Math.floor(Math.random() * 1000 * 100).toString(),'utf-8').toString("base64")
			console.log(`This seems to be the first time you run armadillo.\nTo set it up use this account:\nusername:admin password:${password}\n(password can be changed)`)
			generateUser("admin",password,["admin"])
		}
	})
}

router.get("/login", (req,res) => {
	checkInit()
	res.sendFile(path.join(__dirname,"../../front","login.html"))
})

router.post("/login", (req,res) => {

	const {username,password} = req.body
	if(r_params([username,password])) return res.status(400).send("malformed request")
	db.all(`SELECT * FROM users WHERE id = ?`,[username], (err,data) => {
		if(err || !data[0]) return res.status(401).send("password or username faulty")
		bcrypt.compare(password,data[0].password, (err,result) => {
			if(err) return res.status(401).send("password or username faulty")
			if(result) {
				req.session.user = new User(data[0])
				console.log(req.session.user)
				return res.send("logged in")
			} else return res.status(401).send("password or username faulty")
		})
	})
})

const run = () => {
	process.armadillo.app.use(router)
}

module.exports = {
	run,
	generateUser,
	enabled:true,
	loadorder:2,
	meta: {
		name:"user API",
		description:"Main API for anything user / auth related. This is a core plugin and disabling it would likely lead to armadillo not functioning",
		version:[1,0,0],
		github:"https://github.com/ffamilyfriendly/Armadillo/blob/master/modules/core/user_api.module.js"
	}
}