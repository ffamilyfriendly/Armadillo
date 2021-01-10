const db = require("./database.module").db

module.exports = class {
	constructor(obj) {
		this.id = obj.id
		this.joinedAt = new Date(obj.joinedAt)
		this.lastVisit = new Date(obj.lastVisit)
		this.permissions = new Map()
		this.initialised = false
		this.fetchPerms()
	}

	fetchPerms() {
		db.all(`SELECT * FROM simpleValues WHERE scope = ? & type="permission"`,[this.id], (err,data) => {
			if(err) return console.error(`Could not initalize perms of user with id "${this.id}"`)
			data.forEach( row => this.permissions.set(row.id,row.value))
			console.log(data)
			this.initialised = true
		})
	}
}