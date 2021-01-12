const db = require("./database.module").db

module.exports = class {
	constructor(obj) {
		this.id = obj.id
		this.joinedAt = new Date(obj.joinedAt)
		this.lastVisit = new Date(obj.lastVisit)
		this.picture = obj.picture
		this.admin = obj.id == "admin"
	}
}