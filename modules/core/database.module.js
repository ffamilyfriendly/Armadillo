const { fstat } = require("fs")
const sqlite = require("sqlite3")
const db = new sqlite.Database("./data/data.db")

const run = () => {
	db.serialize(() => {
		db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, password TEXT, picture TEXT, joinedAt INTEGER, lastVisit INTEGER);")
		
		/*
		id, id of the content
		displayname, name to display
		type, media or category
		parent, parent of content
		path, path to the media. If category this does no matter
		hasmeta, 1 if obj has metadata, 0 if not
		*/
		db.run(`CREATE TABLE IF NOT EXISTS content (
			id TEXT PRIMARY KEY,
			displayname TEXT,
			type TEXT,
			parent TEXT, 
			path TEXT,
			hasmeta INTEGER
		);`)

		/*
			id, id of content (matches parent content)
			fullname, full name of content
			description, description of content
			thumbnail, thumbnail of content
			rating, rating of content
			introstart, when the intro starts
			introend, when the intro ends
			outrostart, when the outro starts
		*/
		db.run(`CREATE TABLE IF NOT EXISTS meta (
			id TEXT PRIMARY KEY,
			fullname TEXT,
			description TEXT,
			thumbnail TEXT,
			rating INTEGER,
			introstart INTEGER,
			introend INTEGER,
			outrostart INTEGER
		);`)

		db.run("CREATE TABLE IF NOT EXISTS watching (id TEXT, user TEXT, time INTEGER, max INTEGER)")
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