const status = (cl, t = 1000 * 5) => {
	document.getElementById(cl).classList.remove("hide")
	setTimeout(() => { document.getElementById(cl).classList.add("fadeOut") }, t-2000)
	setTimeout(() => { document.getElementById(cl).classList.add("hide"); document.getElementById(cl).classList.remove("fadeOut") }, t)
}

const doChangePass = (e) => {
	e.preventDefault()
	//old_password, new_password
	const oldPass = document.getElementById("old_password").value
	const newPass = document.getElementById("new_password").value
	if(!oldPass || !newPass) return false

	fetch("/changePassword", {
		method:"POST",
		body: JSON.stringify({oldPass,newPass}),
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(res => {
		if(!res.ok) return status("pass_updateFailed")
		else return status("pass_updateDone")
	})
	.catch(err => {
		status("pass_updateFailed")
	})

}

const registerUser = () => {
	const password = document.getElementById("new_upassword").value
	const username = document.getElementById("new_uusername").value
	if(!password || !username) return

	fetch("/register", {
		method:"POST",
		body: JSON.stringify({username,password}),
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(res => {
		if(!res.ok) return alert("could not register user")
		else return alert("user created!")
	})
	.catch(err => {
		alert("Could not create user")
	})
}

const setImg = (image) => {
	fetch("/profilePic", {
		method:"POST",
		body: JSON.stringify({image}),
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(res => {
		if(!res.ok) return status("pfp_failed")
		else return location.reload()
	})
	.catch(err => {
		status("pfp_failed")
	})
}

const fetchImages = () => {
	//imgContainer
	const container = document.getElementById("imgContainer")
	fetch("/images", {method:"GET"})
	.then(res => res.text())
	.then(text => {
		const imgs = JSON.parse(text)
		Object.keys(imgs).forEach(i => {
			const cImg = document.createElement("img")
			cImg.onclick = () => { setImg(i) }
			cImg.classList = "profilePicture"
			console.log({i,pic:window.armadillo.user.picture})
			if(i === window.armadillo.user.picture) cImg.classList.add("selected")
			cImg.setAttribute("src",`/img/${i}`)
			container.appendChild(cImg)
		})
	})
}

document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("changePassForm").addEventListener("submit",doChangePass)
	fetchImages()
})
