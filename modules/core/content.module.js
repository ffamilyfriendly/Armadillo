const router = require("express").Router()
const path = require("path")
const db = require("./database.module").db
const h = require("./helpers")
const store = require("../../index").store

router.get("/plugins.json",(req,res) => {
	res.send(process.armadillo.plugins)
})

router.get("/search", (req,res) => {
	if(!req.session.user) return res.redirect("/")

	if(!req.query.q) {
		res.sendFile(path.join(__dirname,"../../front/search.html"))
	} else {
		const f = `%${req.query.q}%`
		db.all(`SELECT * FROM content WHERE displayname LIKE ? AND type = "movie"`,[f], (err1,rows1) => {
			if(err1) return res.status(h.http_codes.Internal_error).send(err1)
			res.send(rows1)
		})
	}
})

router.get("/browse/:id", (req,res) => {
	if(!req.session.user) return res.redirect("/")
	const id = req.params.id
	res.render("browse", {me:req.session.user, id})
})

router.get("/:id/new", (req,res) => {
	if(!req.session.user || !req.session.user.admin) return res.redirect("/")
	const rId = Buffer.from(Math.random().toString()).toString("base64")
	const type = req.query.type||"movie"

	db.all("INSERT INTO content VALUES(?,?,?,?,?,?,?)",[rId,"displayname",type,req.params.id,"/","",0])
	db.all("INSERT INTO meta VALUES(?,?,?,?,?,?,?,?)",[rId,"","description","",10,-1,-1,-1])

	res.redirect(`/${rId}/edit`)
})

router.get("/:id/edit", (req,res) => {
	if(!req.session.user || !req.session.user.admin) return res.redirect("/")
	
	db.all(`SELECT * FROM content WHERE id = "${req.params.id}"`, (err, content) => {
		db.all(`SELECT * FROM meta WHERE id = "${req.params.id}"`, (err, _meta) => {
			res.render("new", {content:content[0],meta:_meta[0]})
		})
	})
})

router.post("/:id/main", (req,res) => {
	if(!req.session.user || !req.session.user.admin) return res.status(h.http_codes.Bad_Request).send("not admin")
	const { id, displayname, path, nextUp, hasmeta } = req.body

	db.run("UPDATE content SET displayname = ?, path = ?, next = ?, hasmeta = ? WHERE id = ? ", [displayname,path,nextUp,hasmeta,req.params.id], (err) => {
		if(err) return res.status(h.http_codes.Internal_error).send(err)
		else res.send("updated")
	})
})

router.post("/:id/parent", (req,res) => {
	if(!req.session.user || !req.session.user.admin) return res.status(h.http_codes.Bad_Request).send("not admin")
	const {parent} = req.body
	if(h.r_params(parent)) return res.status(h.http_codes.Bad_Request).send("no parent")

	db.run("UPDATE content SET parent = ? WHERE id = ?", [parent,req.params.id], (err) => {
		if(err) return res.status(h.http_codes.Internal_error).send(err)
		else res.send("updated")
	})
})

router.get("/:id/content", (req,res) => {
	if(!req.session.user) return res.status(h.http_codes.Unauthorized).send("cringe")
	db.all("SELECT * FROM content WHERE parent = ?",[req.params.id],(err,data) => {
		if(err) return res.status(h.http_codes.Internal_error).send("cringe")
		res.send(data)
	})
})

router.get("/:id/media",(req,res) => {
	if(!req.session.user) return res.status(h.http_codes.Unauthorized).send("cringe")
	db.all("SELECT * FROM content WHERE id = ?",[req.params.id],(err, row) => {
		if(err) return res.status(h.http_codes.Internal_error).send(err)
		else res.send(row[0])
	})
})

router.get("/:id/meta", (req,res) => {
	if(!req.session.user) return res.status(h.http_codes.Unauthorized).send("cringe")
	db.all("SELECT * FROM meta WHERE id = ?",[req.params.id],(err, row) => {
		if(err) return res.status(h.http_codes.Internal_error).send(err)
		else res.send(row[0])
	})
})

router.post("/:id/meta", (req,res) => {
	if(!req.session.user || !req.session.user.admin) return res.status(h.http_codes.Bad_Request).send("not admin")
	const {id, fullname, description, thumbnail, rating, introstart, introend, outrostart  } = req.body

	db.run("UPDATE meta SET fullname = ?, description = ?, thumbnail = ?, rating = ?, introstart = ?, introend = ?, outrostart = ? WHERE id = ? ", [fullname,description,thumbnail,rating,introstart,introend,outrostart,req.params.id], (err) => {
		if(err) return res.status(h.http_codes.Internal_error).send(err)
		else res.send("updated")
	})
})

router.post("/:id/setParent",(req,res) => {
	const itemId = req.params.id
	const parentId = req.query.id
	if(!req.session.user || !req.session.user.admin) return res.status(h.http_codes.Unauthorized).redirect("/")
	if(!parentId) return res.status(h.http_codes.Bad_Request).send("no parent id!")
	db.run("UPDATE content SET parent = ? WHERE id = ?",[parentId,itemId])
	res.send("Done!")
})

router.delete("/:id",(req,res) => {
	if(!req.session.user || !req.session.user.admin) return res.status(h.http_codes.Unauthorized).send("no")
	db.run("DELETE FROM content WHERE id = ?",[req.params.id])
	db.run("DELETE FROM meta WHERE id = ?",[req.params.id])
	res.send("deleted")
})

router.get("/watch",(req,res) => {
	if(!req.session.user) return res.redirect("/")
	const { v, extern, type } = req.query
	if(!v && !extern) return res.status(h.http_codes.Bad_Request).send("query param v or extern missing")
	res.render("watch", {v,extern,type,cookie:req.sessionID})
})

router.get("/media/:cookie/:id", (req,res) => {
	const { cookie, id } = req.params

	store.get(cookie, (err,sess) => {
		if(!sess) return res.status(h.http_codes.Unauthorized).send("no")

		db.all("SELECT * FROM content WHERE id = ?",[id],(err,rows) => {
			if(err) return res.status(h.http_codes.Internal_error).send(err)
			if(rows[0]) {
				res.sendFile(rows[0].path)
			} else return res.status(h.http_codes.Not_Found).send("not found")
		})
	})
})

router.get("/:id/timestamp", (req,res) => {
	if(!req.session.user) return res.redirect("/")
	db.all("SELECT * FROM watching WHERE id = ? AND user = ?",[req.params.id,req.session.user.id],(err,data) => {
		if(err) return res.status(h.http_codes.Internal_error).send(err)
		else return res.send(data[0])
	})
})

router.post("/:id/timestamp", (req,res) => {
	if(!req.session.user) return res.redirect("/")
	const {time,max} = req.body
	if(!time || !max) return res.status(h.http_codes.Bad_Request).send("missing time or max in body")

	db.run("INSERT OR REPLACE INTO watching VALUES(?,?,?,?,?)",[req.params.id,req.session.user.id,time,max,`${req.session.user.id}/${req.params.id}`], (err) => {
		if(err) return res.status(h.http_codes.Internal_error).send(err)
		else res.send("noted")
	})
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