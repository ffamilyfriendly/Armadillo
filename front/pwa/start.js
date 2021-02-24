
//this function makes loading screen longer which I just like. #Dealwithit
const resolveRedir = (_url) => {
	setTimeout(() => {
		location.href = _url
	},1500)
}

document.addEventListener("DOMContentLoaded", () => {
	if(location.href.includes("start.html")) {
		console.log("attempting ping...",`${location.protocol}//${location.host}/me`)
		fetch(`${location.protocol}//${location.host}/plugins.json`)
		.then((e) => {
			console.log(e)
			if(e.ok) {
				console.log(e)
				resolveRedir("/browse/root")
			} else {
				console.log("failed!",e)
				resolveRedir("/static/pwa/offline.html")
			}
		})
		.catch(err => {
			resolveRedir("/static/pwa/offline.html")
		})
	}
})