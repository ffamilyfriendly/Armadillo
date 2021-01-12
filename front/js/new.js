window.armadillo.onPluginsLoaded = () => {
	if(window.armadillo.plugins["themoviedb meta grabber"] && window.armadillo.plugins["themoviedb meta grabber"].enabled) {
		document.getElementById("tmdb").classList.remove("hide")
	}
}

let fetched = {}

const initMetaImport = () => {
	document.getElementById("metaImport").classList.remove("hide")
}

const setValue = (n,val) => {
	console.log(n)
	document.getElementById(n).value = val
}

const metaGetAndFill = (id) => {
	console.log("????")
	if(!fetched[id]) return alert("could not find meta")
	const m = fetched[id]
	setValue("fullname",m.media_type == "movie" ? m.original_title : m.name)
	setValue("description",m.overview)
	setValue("posterPath",m.poster_path)
	setValue("rating",m.vote_average)
}

const searchMeta = () => {
	const query = document.getElementById("searchUrl").value
	const container = document.getElementById("metaSearchResults")
	if(!query) return
	fetch(`/meta/search?q=${query}`, {method:"GET"})
	.then(p => p.text())
	.then(t => {
		const data = JSON.parse(t)
		data.results.forEach(m => {
			fetched[m.id] = m
			const mCon = document.createElement("div")
			const importbtn = document.createElement("div")
			importbtn.classList = "meta-import"
			mCon.onclick = () => { metaGetAndFill(m.id) }
			importbtn.innerHTML += `<div> <a href="#"><svg width="50" height="50" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M8 11h-6v10h20v-10h-6v-2h8v14h-24v-14h8v2zm5 2h4l-5 6-5-6h4v-12h2v12z"/></svg></a> </div>`

			mCon.appendChild(importbtn)

			console.log(m)
			mCon.classList = "mdb-res"
			mCon.innerHTML += `<img src="https://image.tmdb.org/t/p/w500/${m.poster_path}" alt="movie poster"/>`
			const oMc = document.createElement("div")
			oMc.classList = "metaContent"
			oMc.innerHTML += `<h1>${m.media_type == "movie" ? m.original_title : m.name}</h1>`
			oMc.innerHTML += `<p>${m.overview}</p>`
			oMc.innerHTML += `<p><b>rating:</b>${m.vote_average||"---"}/10 <b>Released:</b> ${m.media_type == "movie" ? m.release_date : m.first_air_date}</p>`
			mCon.appendChild(oMc)
			container.appendChild(mCon)
		})
	})
	.catch(err => console.error(err))
}