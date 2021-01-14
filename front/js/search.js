let nf = false

const resolveNfUrl = (url) => {
	fetch(`/nyafilmer/resolveurl?u=${url}`, { method:"GET" })
	.then(p => p.text())
	.then(u => {
		console.log(u)
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
			r.onclick = () => { resolveNfUrl(m.link) }
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
	
			r.innerHTML += `<div class="padding-large rating-container"><div class="padding-large rating ${rLvl}"><b>${m.imdb}</b>/10</div></div>`
			c.appendChild(r)
		})
	})
}

const doSearch = () => {
	const query = document.getElementById("searchbar").value
	const c = document.getElementById("sRes")

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