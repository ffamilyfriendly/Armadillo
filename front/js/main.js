window.armadillo = {
	user:{},
	plugins:{},
	onUserLoaded:null,
	onPluginsLoaded:null,
	loggedIn:false
}

fetch("/me", { method:"GET" })
.then(res => res.text().then(t => {
	if(t != "no user object exists") {window.armadillo.user = JSON.parse(t); window.armadillo.loggedIn = true}
	if(window.armadillo.onUserLoaded) window.armadillo.onUserLoaded()
}))

fetch("/plugins.json", { method:"GET" })
.then(res => res.text().then(t => {
	t = JSON.parse(t)
	t.forEach(p => {
		window.armadillo.plugins[p.meta.name] = p
	})
	if(window.armadillo.onPluginsLoaded) window.armadillo.onPluginsLoaded()
}))

