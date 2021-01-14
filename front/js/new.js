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
	document.getElementById(n).value = val
}

const metaGetAndFill = (id) => {
	if(!fetched[id]) return alert("could not find meta")
	document.getElementById("updated-notification").classList.remove("hide")
	const m = fetched[id]
	setValue("fullname",m.media_type == "movie" ? m.original_title : m.name)
	setValue("description",m.overview)
	setValue("thumbnail",m.poster_path)
	setValue("rating",m.vote_average)
}

const saveMetaData = () => {
	const id = document.getElementById("r_id").value
	const fullname = document.getElementById("fullname").value
	const description = document.getElementById("description").value
	const thumbnail = document.getElementById("thumbnail").value
	const rating = document.getElementById("rating").value
	const introstart = document.getElementById("introstart").value
	const introend = document.getElementById("introend").value
	const outrostart = document.getElementById("outrostart").value

	fetch(`/${id}/meta`, {
		method:"POST",
		body: JSON.stringify({fullname,description,description,thumbnail,rating,introstart,introend,outrostart}),
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(res => {
		if(!res.ok) return alert("meta could not be saved")
		alert("saved metadata")
	})
	.catch(err => {
		alert("Could not save meta data (check logs)")
		console.error(err)
	})
}

const saveMainData = () => {
	const id = document.getElementById("r_id").value
	const displayname = document.getElementById("displayname").value
	const path = document.getElementById("path").value
	const nextUp = document.getElementById("nextUp").value
	const hasmeta = document.getElementById("hasmeta").value

	fetch(`/${id}/main`, {
		method:"POST",
		body: JSON.stringify({displayname,path,hasmeta,nextUp}),
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(res => {
		if(!res.ok) return alert("main data could not be saved")
		alert("saved main data")
	})
	.catch(err => {
		alert("Could not save main data (check logs)")
		console.error(err)
	})
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
			importbtn.innerHTML += `<div> <a style="cursor:pointer;"><svg width="50" height="50" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M8 11h-6v10h20v-10h-6v-2h8v14h-24v-14h8v2zm5 2h4l-5 6-5-6h4v-12h2v12z"/></svg></a> </div>`

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

window.addEventListener("scroll", () => {
	var element = document.getElementById('top');
	var position = element.getBoundingClientRect();

	if(position.top < window.innerHeight && position.bottom >= 0) {
		doSlideUp()
	}
})

const doSlideUp = () => {
	const uc = document.getElementById("un-content")
	uc.classList.add("slideUp")

	setTimeout(() => {
		document.getElementById("updated-notification").classList.add("hide")
		uc.classList.remove("slideUp")
	},1000 * 0.5)
}