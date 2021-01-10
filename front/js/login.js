const imagery = [ 
	{ img:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Houses_in_Norra_Hamnen%2C_Lysekil_at_night.jpg/800px-Houses_in_Norra_Hamnen%2C_Lysekil_at_night.jpg", cred: {u:{label:"W.carter", link:"https://commons.wikimedia.org/wiki/User:W.carter"}} },
	{ img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Manhattan_from_Weehawken%2C_NJ.jpg/799px-Manhattan_from_Weehawken%2C_NJ.jpg", cred: {u:{label:"Dmitry Avdeev", link:"https://commons.wikimedia.org/wiki/User:Russavia"}} },
	{ img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Night_in_Shinjuku_3.JPG/800px-Night_in_Shinjuku_3.JPG", cred: {u:{label:"Martin Falbisoner", link:"https://commons.wikimedia.org/wiki/User:Martin_Falbisoner"}} }

]

document.addEventListener("DOMContentLoaded", () => {
	const randomImage = imagery[Math.floor(Math.random() * imagery.length)]
	document.getElementById("login_background").style.backgroundImage = `url("${randomImage.img}")`
	document.getElementById("cred_link").setAttribute("href",randomImage.cred.u.link)
	document.getElementById("cred_name").innerText = randomImage.cred.u.label

	const form = document.getElementById("mainform")
	form.addEventListener("submit",event => {
		event.preventDefault();

		const password = document.getElementById("password").value
		const username = document.getElementById("username").value

		if(!password || !username) return

		console.log({password,username})

		fetch("/login", {
			method:"POST",
			body: JSON.stringify({username,password}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(res => {
			console.log(document.referrer)
			if(!res.ok) document.getElementById("passErr").classList.remove("hide")
			else {document.getElementById("passOk").classList.remove("hide"); setTimeout(() => location.href = "/", 2000)}
		})
		.catch(err => {
			document.getElementById("passErr").classList.remove("hide")
		})
	})
})




