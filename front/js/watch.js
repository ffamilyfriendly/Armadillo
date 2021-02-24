let id = ""
let extern = true
let player = document.createElement("video")
let lastTime = -1
let movie
let nextUp
let mainInterval

//https://stackoverflow.com/questions/41742390/javascript-to-check-if-pwa-or-mobile-web
const isInStandaloneMode = () => (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://');

const inFullScreen = () => {
	return (document.fullscreenElement && document.fullscreenElement !== null) ||
	(document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
	(document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
	(document.msFullscreenElement && document.msFullscreenElement !== null);
}

const checkOutroIntro = () => {
	if(!movie) return

	if(movie.introstart > 0 && Math.abs(movie.introstart - player.currentTime) < 5) player.currentTime = movie.introend

	if(!nextUp) return
	if(movie.outrostart > 1 && player.currentTime > movie.outrostart) {
		clearInterval(mainInterval)
		doNotification("end-movie",1000 * 10)
		setTimeout(() => {
			location.href = `/watch?v=${nextUp.id}`
		}, 1000 * 10)
	}
}

const setTimeStamp = () => {

	checkOutroIntro()
	const max = player.duration
	const time = player.currentTime
	if(time === lastTime) return
	lastTime = time
	fetch(`/${id}/timestamp`, {
		method:"POST",
		body: JSON.stringify({max,time}),
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(res => {
		if(!res.ok) return console.warn(`[Timestamp] time ${time}/${max} could not be saved`)
		console.log(`[Timestamp] time ${time}/${max} saved`)
	})
	.catch(err => {
		console.warn(`[Timestamp] time ${time}/${max} could not be saved`)
		console.error(err)
	})
}

const getNextUp = (nid) => {
	fetch(`/${nid}/media`)
	.then(p => p.text())
	.then(d => {
		if(!d) return
		d = JSON.parse(d)
		nextUp = d
		document.getElementById("next-up-name").innerText = d.displayname
	})
}

const getDataThing = () => {
	fetch(`/${id}/media`)
	.then(p => p.text())
	.then(d => {
		if(!d) return
		d = JSON.parse(d)
		movie = { base:d }
		if(d.next) getNextUp(d.next)
		checkIfDownloadable()
		if(d.hasmeta) {
			fetch(`/${id}/meta`)
			.then(pp => pp.text())
			.then(dd => {
				if(!dd) return
				dd = JSON.parse(dd)

				movie = dd
				movie.base = d
				console.log({movie_object:d,meta_object:dd})
				checkIfDownloadable()
				if(player.nodeName === "AUDIO") doMeta()
			})
		} else if(player.nodeName === "AUDIO") doMeta()
	})
}

const initTimestamp = () => {
	getDataThing()

	fetch(`/${id}/timestamp`, { method:"GET" })
	.then(p => p.text())
	.then(d => {
		if(!d) return mainInterval = setInterval(setTimeStamp,2000)
		d = JSON.parse(d)

		const handle = doNotification("has-watched",-1,true)
		document.querySelector("#resumebtn").onclick = () => { 
			player.currentTime = d.time
			mainInterval = setInterval(setTimeStamp,2000)
			handle()
		}
		document.querySelector("#closebtn").onclick = () => { handle(); mainInterval = setInterval(setTimeStamp,2000) }
		console.log(d)
	})
}

const doNotification = (notifName,showTime,requireAnswer) => {
	if(inFullScreen()) document.exitFullscreen()

	const notif = document.getElementById(notifName)
	notif.classList.add("slideUp")
	notif.classList.remove("hide")

	if(!requireAnswer) {
		setTimeout(() => {
			notif.classList.add("hide")
		},showTime)
	} else return () => { notif.classList.add("hide") }
}

const doMeta = () => {
	fetch(`/${id}/media`)
	.then(d => d.text())
	.then(data => {
		data = JSON.parse(data)
		document.getElementById("ap_title").innerText = data.displayname
		if(movie && movie.thumbnail) {
			document.getElementById("ap_img").setAttribute("src",movie.thumbnail)
		}
	})
}


document.addEventListener("DOMContentLoaded", () => {
	id = document.getElementById("id").value
	if(id) { extern = false; initTimestamp(); }
	player = document.querySelector(".player")
	console.log(`standalone?: ${isInStandaloneMode()}`)
	if(isInStandaloneMode()) {
		document.getElementById("isPwa").classList.remove("hide")
	}
})

const checkIfDownloadable = () => {
	const dlarea = document.getElementById("isPwa")
	getKey(movie.base.id).then(i => {
		if(i) {
			//already downloaded
			dlarea.classList.add("success")
			dlarea.innerHTML = `
				<div class="padding-medium">
				<a style="cursor: pointer;" onclick="resolveDeletion('${movie.base.id}'); location.reload()">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"/></svg>
				</a>
				remove from offline mode
			</div>
			`
			return
		} else {
			fetch(`/media/${movie.base.id}/size`)
			.then(t => t.json())
			.then(dat => {
				try {
					document.getElementById("size_f").innerText = `${(dat.size/1000000).toFixed(2)} mb`
					navigator.storage.estimate().then(t => {
						const sLeft = t.quota - t.usage
						if(sLeft < dat.size && false) {
							//not enough space!
							dlarea.classList.add("error")
							dlarea.innerHTML = `
								<div class="padding-medium">
									<b>Cannot download - Out of space!</b> Operation requires ${(dat.size/1000000).toFixed(2)}mb but only ${(sLeft/1000000).toFixed(2)}mb are availible
								</div>
							`
						}
					})
				} catch(err) {
					console.log(err)
				}
			})
		}
	})
}

const initOfflineMeta = () => {

	caches.open("armadillo").then(cache => {
		cache.add(movie.thumbnail.startsWith("/") ? `https://image.tmdb.org/t/p/w500/${movie.thumbnail}` : movie.thumbnail)
	})

	fetch(`/${id}/timestamp`, { method:"GET" })
	.then(d => d.text())
	.then(t => {
		try {
			t = JSON.parse(t)
		} catch(err) {
			console.log(err)
			t = null
		}
		saveMetaToDb({ stamp:t, meta:movie },movie.base.id)
	})
}

const downloadMedia = () => {
	const src = document.querySelector("source")
	if(!src) return alert("Cant save content. Is content external?")
	const srcUrl = src.getAttribute("src")
	console.log(movie)
	saveContent(srcUrl,movie.base.id)
	initOfflineMeta()
}