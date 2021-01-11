const db = require("./database.module").db

module.exports = class {
	constructor(obj) {
		this.id = obj.id
		this.joinedAt = new Date(obj.joinedAt)
		this.lastVisit = new Date(obj.lastVisit)
		this.permissions = {}
	}

	allowed(perm) {
		return this.permissions[perm] && this.permissions[perm] === "true"
	}

	getPerms() {
		return new Promise((resolve,reject) => {
			let perms = {}
			db.all(`SELECT * FROM simpleValues WHERE scope = ? AND type = "permission"`,[this.id] , (err,data) => {
				if(err) {reject(`Could not initalize perms of user with id "${this.id}"`)}
				data.forEach( row => perms[row.id] = row.value)
				resolve(perms)
			})
		})
	}
}