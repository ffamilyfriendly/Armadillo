let id = ""

/**
 * 
 * @param {Element} el 
 * @param {*} id 
 */
const doMeta = (el, id) => {
	//container.classList.remove("skel","skel-content")
	const mC = document.getElementById(id)

	fetch(`/${id}/meta`, { method:"GET" })
	.then(p => p.text())
	.then(meta => {
		meta = JSON.parse(meta)
		console.log(meta)

		if(meta.thumbnail) {
			const img = document.querySelector("img")
			img.setAttribute("src", meta.thumbnail.startsWith("/") ? `https://image.tmdb.org/t/p/w500/${meta.thumbnail}` : meta.thumbnail)
			img.classList.remove("skel")

			if(img.complete) {
				el.classList.remove("skel","skel-content")
			} else {
				img.addEventListener("load", () => {
					el.classList.remove("skel","skel-content")
				})

				setTimeout(() => {
					el.classList.remove("skel","skel-content")
				}, 1000 * 10)
			}


			el.prepend(img)
		}
	
		mC.innerHTML += `<p>${meta.description}</p>`

		let rLvl = "shitty"
		if(meta.rating > 3) rLvl = "bad"
		if(meta.rating > 5) rLvl = "meh"
		if(meta.rating > 7) rLvl = "good"
		if(meta.rating > 9) rLvl = "godly"

		mC.innerHTML += `<div class="padding-large rating-container"><div class="padding-large rating ${rLvl}"><b>${meta.rating}</b>/10</div></div>`
		
		if(meta.fullname) {
			mC.querySelector("h1").innerText = meta.fullname
		}
		
		document.getElementById(id).innerHTML = mC.innerHTML
	})
}

const removeItem = (id) => {
	if(confirm("are you sure?")) {
		fetch(`/${id}`,{ method:"DELETE" })
		alert("deleted")
	}
}

const pasteItem = () => {
	const _id = localStorage.getItem("copy")
	if(!_id) return alert("nothing in clipboard")

	fetch(`/${_id}/setParent?id=${id}`, { method:"POST" })
	.then(p => {
		if(!p.ok) {alert("could not set parent"); localStorage.removeItem("copy")}
		else location.reload()
	})
}

const copyItem = (iId) => {
	localStorage.setItem("copy",iId)
}

const doHasWatched = (id,e) => {
	fetch(`/${id}/timestamp`)
	.then(p => p.text())
	.then(d => {
		if(!d) return
		d = JSON.parse(d)
		const percentWatched = (d.time / d.max) * 100
		console.log(percentWatched)
		e.innerHTML += `<div class="pbar-outer"> <div class="pbar-inner" style="width:${percentWatched}%" > </div> </div>`
	})
}

const doContent = (cc) => {
	const mContainer = document.getElementById("filmContainer")
	cc.forEach(c => {
		const container = document.createElement("div")
		container.innerHTML += `<img>`
		container.classList = `surface content padding-medium margin-medium ${c.type} skel skel-content`
		console.log(c)

		container.onclick = () => { if(c.type === "movie") {location.href = `/watch?v=${c.id}`} else {location.href = `/browse/${c.id}`} }

		container.innerHTML += `<div class="padding-medium" id="${c.id}"> <h1>${c.displayname}</h1> </div>`
		if(window.armadillo.user.admin) {
			container.innerHTML += `<div class="edit-btn margin-medium">
			<a href="/${c.id}/edit"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7.127 22.564l-7.126 1.436 1.438-7.125 5.688 5.689zm-4.274-7.104l5.688 5.689 15.46-15.46-5.689-5.689-15.459 15.46z"/></svg></a> 
			<a onclick="removeItem('${c.id}')" href="/browse/${id}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"/></svg></a>
			<a onclick="copyItem('${c.id}')" href="/browse/${id}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12.026 14.116c-3.475 1.673-7.504 3.619-8.484 4.09-1.848.889-3.542-1.445-3.542-1.445l8.761-4.226 3.265 1.581zm7.93 6.884c-.686 0-1.393-.154-2.064-.479-1.943-.941-2.953-3.001-2.498-4.854.26-1.057-.296-1.201-1.145-1.612l-14.189-6.866s1.7-2.329 3.546-1.436c1.134.549 5.689 2.747 9.614 4.651l.985-.474c.85-.409 1.406-.552 1.149-1.609-.451-1.855.564-3.913 2.51-4.848.669-.321 1.373-.473 2.054-.473 2.311 0 4.045 1.696 4.045 3.801 0 1.582-.986 3.156-2.613 3.973-1.625.816-2.765.18-4.38.965l-.504.245.552.27c1.613.789 2.754.156 4.377.976 1.624.819 2.605 2.392 2.605 3.97 0 2.108-1.739 3.8-4.044 3.8zm-2.555-12.815c.489 1.022 1.876 1.378 3.092.793 1.217-.584 1.809-1.893 1.321-2.916-.489-1.022-1.876-1.379-3.093-.794s-1.808 1.894-1.32 2.917zm-3.643 3.625c0-.414-.335-.75-.75-.75-.414 0-.75.336-.75.75s.336.75.75.75.75-.336.75-.75zm6.777 3.213c-1.215-.588-2.604-.236-3.095.786-.491 1.022.098 2.332 1.313 2.919 1.215.588 2.603.235 3.094-.787.492-1.021-.097-2.33-1.312-2.918z"/></svg></a>
			</div>`
		}

		mContainer.appendChild(container)
		if(c.type === "movie") doHasWatched(c.id,container) 
		else {container.classList.remove("skel","skel-content"); container.querySelector("img").remove()}
		if(c.hasmeta) doMeta(container, c.id)
		else {
			container.querySelector("img").remove()
			container.classList.remove("skel","skel-content")
		}
	})
}

const insertContent = () => {
	console.log(id)
	fetch(`/${id}/content`, { method:"GET" })
	.then(r => r.text())
	.then( text => {
		document.getElementById("skeleteons").remove()
		const cJSON = JSON.parse(text)
		doContent(cJSON)
	} )
}

window.armadillo.onPluginsLoaded = () => { insertContent() }

document.addEventListener("DOMContentLoaded", () =>  {
	id = document.getElementById("id").value
	if(localStorage.getItem("copy")) {
		const bro = document.getElementById("footerContainer")
		bro.innerHTML += `<a id="pasteThingie" onclick="pasteItem()" href="#"> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 19h-4v-2h4v2zm2.946-4.036l3.107 3.105-4.112.931 1.005-4.036zm12.054-5.839l-7.898 7.996-3.202-3.202 7.898-7.995 3.202 3.201zm-6 8.92v3.955h-16v-18h4l2.102 2h3.898l2-2h4v1.911l2-2.024v-1.887h-3c-1.229 0-2.18-1.084-3-2h-8c-.82.916-1.771 2-3 2h-3v22h20v-7.98l-2 2.025zm-8-16.045c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1z"/></svg> </a>`
	}
})