
//this function makes loading screen longer which I just like. #Dealwithit
const resolveRedir = (_url) => {
	setTimeout(() => {
		location.href = _url
	},1500)
}

let timesClicked = 0;

const doDebug = () => {
	if(timesClicked > 3) {
		const dbug = localStorage.getItem("debug")
		alert(dbug ? "de-activated debug mode" : "activated debug mode")
		localStorage.setItem("debug",!dbug)
	}
	timesClicked++;
}

document.addEventListener("DOMContentLoaded", () => {
	if(document.getElementById("start-loading")) {
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