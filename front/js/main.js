window.armadillo = {
	user:{},
	loggedIn:false
}

fetch("/me", { method:"GET" })
.then(res => res.text().then(t => {
	if(t != "no user object exists") {window.armadillo.user = JSON.parse(t); window.armadillo.loggedIn = true}
}))
