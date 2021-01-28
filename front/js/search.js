let nf = false

let cached = {}

const resolveNfUrl = (url) => {
	document.getElementById("loadingNF").classList.remove("hide")
	localStorage.setItem("nyafilmer", JSON.stringify(cached[url]))
	const socketProtocol = (location.protocol === 'https:' ? 'wss:' : 'ws:')
	let socket = new WebSocket(`${socketProtocol}//${location.host}`);
	socket.onopen = () => {
		console.log("[SOCKET] established connection!")
		socket.send(JSON.stringify({type:"add", data:url, user:window.armadillo.user.id}))
	}

	socket.onmessage = (e) => {
		const d = JSON.parse(e.data)
		if(d.type == "DONE") {
			document.getElementById("status").innerText = "redirecting..."
			location.href = `/watch?extern=${d.data}`
		}
		if(d.type == "error") {
			document.getElementById("status").innerText = d.data
			document.querySelectorAll(".lds-facebook div").forEach(e => e.style.background = "var(--error)")
			setTimeout(() => {
				socket.close()
				document.querySelectorAll(".lds-facebook div").forEach(e => e.style.background = "var(--primary)")
			},5000)
		}
	}

	socket.onclose = (e) => {
		if(e.wasClean) console.log("[SOCKET] socket closed neatly")
		else console.log("[SOCKET] socket closed badly")
		document.getElementById("loadingNF").classList.add("hide")
		socket.close()
	}

	socket.onerror = (err) => {
		console.error(`[SOCKET] error`,err)
	}
}

/**
 * 
 * @param {Element} e 
 */
const seasonItemOnclick = (e) => {
	const vid = e.getAttribute("vid")

	const oldActive = document.querySelector("a.active")
	oldActive.classList.remove("active")
	e.classList.add("active")
	const old_vid = oldActive.getAttribute("vid")

	document.querySelector(`ul[sid="${old_vid}"]`).style.display = "none"
	document.querySelector(`ul[sid="${vid}"]`).style.display = "inherit"

	console.log(vid)
}

const fixLinkThing = (e) => {
	e.preventDefault()
	resolveNfUrl(e.target.pathname)
}

const doModal = (c) => {
	const mContainer = document.createElement("div")
	mContainer.id = "modal-container"
	document.body.appendChild(mContainer)

	const container = document.createElement("div")
	const closeBtn = document.createElement("button")
	closeBtn.classList = "btn-close"
	closeBtn.innerText = "x"
	closeBtn.onclick = () => { mContainer.remove() }

	container.id = "m-inner"
	container.classList = "surface padding-large"
	container.innerHTML = c
	container.prepend(closeBtn)
	mContainer.appendChild(container)

	document.querySelectorAll("a.open_season").forEach(s => s.addEventListener("click",() => {seasonItemOnclick(s)}))
	document.querySelectorAll("a.postTabsLinks").forEach(l => l.addEventListener("click",fixLinkThing))
}

const resolveTitle = (link) => {
	fetch(`/nyafilmer/scrape?u=${link}`)
	.then(p => p.text())
	.then(d => {
		if(!d.includes("Season List")) return resolveNfUrl(link)
		const content = d.split("Season List</h3>")[1].split("<script")[0]
		doModal(content)
	})
}

const doNfSearch = () => {
	if(!nf) return
	
	const query = document.getElementById("searchbar").value
	const c = document.getElementById("sRes")

	fetch(`/nyafilmer?q=${query}`, { method:"GET" })
	.then(p => p.text())
	.then(res => {
		res = JSON.parse(res)

		res.forEach(m => {
			const r = document.createElement("div")
			r.onclick = () => { resolveTitle(m.link) }
			r.classList = "surface content"
			r.innerHTML += `<img src="https://nyafilmer.vip${m.image}">`
			r.innerHTML += `
			<div class="padding-medium">
				<h1>${m.title}</h1>
				<p>från nyafilmer</p>
			</div>`

			let rLvl = "shitty"
			m.imdb = Number(m.imdb)
			if(m.imdb > 3) rLvl = "bad"
			if(m.imdb > 5) rLvl = "meh"
			if(m.imdb > 7) rLvl = "good"
			if(m.imdb > 9) rLvl = "godly"

			cached[m.link] = m
	
			r.innerHTML += `<div class="padding-large rating-container"><div class="padding-large rating ${rLvl}"><b>${m.imdb}</b>/10</div></div>`
			c.appendChild(r)
		})
	})
}

const doSearch = () => {
	const query = document.getElementById("searchbar").value
	const c = document.getElementById("sRes")

	c.innerHTML = ""

	fetch(`/search?q=${query}`,{ method:"GET" })
	.then(p => p.text())
	.then(d => {
		d = JSON.parse(d)
		d.forEach(res => {
			
			const r = document.createElement("div")
			r.classList = "surface content"
			r.onclick = () => { location.href = `/watch?v=${res.id}` }
			if(res.hasmeta) {
				fetch(`/${res.id}/meta`, { method:"GET" })
				.then(pp => pp.text())
				.then(mRes => {
					mRes = JSON.parse(mRes)
					if(mRes.thumbnail) {
						r.innerHTML += `<img src="${mRes.thumbnail.startsWith("/") ? `https://image.tmdb.org/t/p/w500/${mRes.thumbnail}` : mRes.thumbnail}">`
					}
					r.innerHTML += `<div class="padding-medium"> <h1>${mRes.fullname||res.displayname}</h1> <p>${mRes.description}</p> </div>`
				})
			} else {
				r.innerHTML += `<div class="padding-medium"><h1>${res.displayname}</h1></div>`
			}

			c.appendChild(r)
		})
	})

	doNfSearch()
}



window.armadillo.onPluginsLoaded = () => {
	nf = window.armadillo.plugins["Nya filmer scraper"] && window.armadillo.plugins["Nya filmer scraper"].enabled
}