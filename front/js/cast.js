//Code is per usual from so https://stackoverflow.com/questions/31937269/how-to-implement-chromecast-support-for-html5-player

document.addEventListener("DOMContentLoaded", () => {
	var loadCastInterval = setInterval(function(){
		if (typeof chrome != "undefined" && chrome.cast.isAvailable) {
				console.log('Cast has loaded.');
				document.querySelectorAll(".cast-enabled").forEach(cItem => cItem.classList.remove("hide"))
				clearInterval(loadCastInterval);
				initializeCastApi();
		} else {
				clearInterval(loadCastInterval);
				console.log('Chromecasting is not availible.');
		}
}, 1000);
})

function initializeCastApi() {
	cast.framework.setLoggerLevel(0)
	var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
	var sessionRequest = new chrome.cast.SessionRequest(applicationID);
	var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
			sessionListener,
			receiverListener);
	chrome.cast.initialize(apiConfig, onInitSuccess, onInitError);
};

function sessionListener(e) {
	session = e;
	console.log('New session');
	if (session.media.length != 0) {
			console.log('Found ' + session.media.length + ' sessions.');
	}
}

function receiverListener(e) {
	if( e === 'available' ) {
			console.log("Chromecast was found on the network.");
	}
	else {
			console.log("There are no Chromecasts available.");
	}
}

function onInitSuccess() {
	console.log("Initialization succeeded");
}

function onInitError() {
	console.log("Initialization failed");
}

function launchApp() {
	console.log("Launching the Chromecast App...");
	chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
}

function onRequestSessionSuccess(e) {
	console.log("Successfully created session: " + e.sessionId);
	session = e;
}

function onLaunchError() {
	console.log("Error connecting to the Chromecast.");
}

function onRequestSessionSuccess(e) {
	console.log("Successfully created session: " + e.sessionId);
	session = e;
	loadMedia();
}

const funFact = () => {
	const funFactArray = [
		"The heads on Easter Island have bodies.",
		"The moon has moonquakes.",
		"Goosebumps are meant to ward off predators.",
		"Humans are the only animals that blush.",
		"The hottest spot on the planet is in Libya.",
		"A chef’s toque contains 100 folds.",
		"Rabbits can’t puke.",
		"Copper door knobs are self-disinfecting.",
		"familyfriendly.xyz"
	]

	return funFactArray[Math.floor(Math.random() * funFactArray.length)]
}

const getMimeType = (u) => {
	return new Promise((resolve,reject) => {
		const xhr = new XMLHttpRequest;
		xhr.responseType = "blob"
		xhr.open("GET",u,true)
		xhr.setRequestHeader("Range",`bytes=0-1`)
	
		xhr.onreadystatechange = () => {
			if(xhr.readyState != 4) return
		}
	
		xhr.onload = () => {
			resolve(xhr.getResponseHeader("Content-Type"))
		}

		xhr.send(null)
	})
}

const loadMedia = async () => {
	if (!session) {
			console.log("No session.");
			return;
	}

	const player = document.querySelector(".player")
	const source = player.querySelector("source")

	//productionhost
	const host = `${location.protocol}//${location.host}${source.getAttribute("src")}`

	console.log(host)
	var mediaInfo = new chrome.cast.media.MediaInfo(host);
	mediaInfo.contentType = await getMimeType(host)
	mediaInfo.contentUrl = host
	mediaInfo.currentTime = player.currentTime
	mediaInfo.duration = player.duration

	var meta = new chrome.cast.media.GenericMediaMetadata()
	meta.images = [ new chrome.cast.Image(movie.thumbnail) ]
	meta.title = movie.fullname||movie.base.displayname
	meta.subtitle = movie.description||`The admin of ${location.hostname} has not added any description for this file. Let me fill this void with a fun fact! "${funFact()}"`
	mediaInfo.metadata = meta

	var request = new chrome.cast.media.LoadRequest(mediaInfo);
	request.autoplay = true
	request.currentTime = player.currentTime
	session.loadMedia(request, onLoadSuccess, onLoadError);
}

function onLoadSuccess() {
	console.log('Successfully loaded media.');
	document.querySelector(".cast-icon svg path").style.fill = "cyan"
	document.querySelector(".cast-icon").onclick = stopApp
}

function onLoadError() {
	console.log('Failed to load media.');
	document.querySelector(".cast-icon svg path").style.fill = "red"
}

function stopApp() {
	document.querySelector(".cast-icon svg path").style.fill = "white"
	document.querySelector(".cast-icon").onclick = launchApp
	session.stop(onStopAppSuccess, onStopAppError);
}

function onStopAppSuccess() {
	console.log('Successfully stopped app.');
}

function onStopAppError() {
	console.log('Error stopping app.');
}