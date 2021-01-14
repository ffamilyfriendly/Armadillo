let id = ""

/**
 * 
 * @param {Element} el 
 * @param {*} id 
 */

const doMeta = (el, id) => {
	const mC = document.getElementById(id)

	fetch(`/${id}/meta`, { method:"GET" })
	.then(p => p.text())
	.then(meta => {
		meta = JSON.parse(meta)
		console.log(meta)

		if(meta.thumbnail) {
			const img = document.createElement("img")
			img.setAttribute("src", meta.thumbnail.startsWith("/") ? `https://image.tmdb.org/t/p/w500/${meta.thumbnail}` : meta.thumbnail)
			el.prepend(img)
		}

		if(meta.fullname) {
			mC.getElementsByTagName("h1")[0].innerText = meta.fullname
		}
	
		mC.innerHTML += `<p>${meta.description}</p>`

		let rLvl = "shitty"
		if(meta.rating > 3) rLvl = "bad"
		if(meta.rating > 5) rLvl = "meh"
		if(meta.rating > 7) rLvl = "good"
		if(meta.rating > 9) rLvl = "godly"

		mC.innerHTML += `<div class="padding-large rating-container"><div class="padding-large rating ${rLvl}"><b>${meta.rating}</b>/10</div></div>`
	})
}

const removeItem = (id) => {
	if(confirm("are you sure?")) {
		fetch(`/${id}`,{ method:"DELETE" })
		alert("deleted")
	}
}

const doContent = (cc) => {
	const mContainer = document.getElementById("filmContainer")
	cc.forEach(c => {
		const container = document.createElement("div")
		container.classList = `surface content padding-medium margin-medium ${c.type}`
		console.log(c)

		container.onclick = () => { if(c.type === "movie") {location.href = `/watch?v=${c.id}`} else {location.href = `/browse/${c.id}`} }

		container.innerHTML += `<div class="padding-medium" id="${c.id}"> <h1>${c.displayname}</h1> </div>`
		if(window.armadillo.user.admin) {
			container.innerHTML += `<div class="edit-btn margin-medium"><a href="/${c.id}/edit"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7.127 22.564l-7.126 1.436 1.438-7.125 5.688 5.689zm-4.274-7.104l5.688 5.689 15.46-15.46-5.689-5.689-15.459 15.46z"/></svg></a> <a onclick="removeItem('${c.id}')" href="/browse/${id}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"/></svg></a></div>`
		}

		mContainer.appendChild(container)
		if(c.hasmeta) doMeta(container, c.id)
	})
}

const insertContent = () => {
	console.log(id)
	fetch(`/${id}/content`, { method:"GET" })
	.then(r => r.text())
	.then( text => {
		const cJSON = JSON.parse(text)
		doContent(cJSON)
	} )
}

document.addEventListener("DOMContentLoaded", () =>  {
	id = document.getElementById("id").value
	insertContent()
})