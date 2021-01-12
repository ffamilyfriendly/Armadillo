const { fstat } = require("fs")
const sqlite = require("sqlite3")
const db = new sqlite.Database("./data/data.db")

const setGlobalPerms = () => {
	db.all("SELECT * FROM simpleValues WHERE scope=\"global\"", (err, data) => {
		data.forEach( row => {
			process.armadillo.permissions[row.id] = row
		})
	})
}

const run = () => {
	db.serialize(() => {
		db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, password TEXT, joinedAt INTEGER, lastVisit INTEGER);")
		db.run("CREATE TABLE IF NOT EXISTS simpleValues (id TEXT, scope TEXT, type TEXT, value TEXT);")
		db.run("CREATE TABLE IF NOT EXISTS invites (id TEXT PRIMARY KEY, uses INTEGER, description TEXT);")
		setGlobalPerms()
	})
}

module.exports = {
	db,
	run,
	enabled:true,
	loadorder:0,
	meta: {
		name:"database",
		description:"Prepares database structure and loads the database. This is a core plugin and disabling it would likely lead to armadillo not functioning",
		version:[1,0,0],
		github:"https://github.com/ffamilyfriendly/Armadillo/blob/master/modules/core/database.module.js"
	}
}