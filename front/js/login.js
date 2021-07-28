const doLogin = (password, username) => {

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
		if(!res.ok) {
			const toast = new Toast("wrong password", { type: "error", expireTime: 7 })
			return
		}
		location.href = "/browse/root"
	})
	.catch(err => {
		alert("wrong password")
	})
}

const handleLogin = (pp) => {
	if(window.armadillo.loggedIn && window.armadillo.user.id == pp) return location.href = "/browse/root"
	const lModal = new Modal(`Login as ${pp}`)

	const inpt = document.createElement("input")
	const btn = document.createElement("button")
	btn.classList = "button login-btn button-large primary full-width disabled curved"
	btn.innerText = "login"
	btn.onclick = () => {
		if(inpt.value.length <= 0) return;
		doLogin(inpt.value, pp)
	}

	inpt.type = "password"
	inpt.classList = "password padding-medium curved"
	inpt.onkeydown = () => {
		if(inpt.value.length > 0) btn.classList.remove("disabled")
		else btn.classList.add("disabled")
	}

	lModal.body.append(inpt, btn)

	//const pass = prompt(`password for ${pp}`)
	//if(!pass) return
	//doLogin(pass,pp)
}

const manageUser = (user) => {
	const container = document.getElementById("profiles")
	const profileDiv = document.createElement("div")
	profileDiv.classList = "profile"
	profileDiv.innerHTML += `<img src="/img/${user.picture}">`
	profileDiv.innerHTML += `<h1 class="text-center">${user.id}</h1>`

	profileDiv.onclick = () => { handleLogin(user.id) }

	container.appendChild(profileDiv)
}

const getUsers = () => {
	fetch("/users", {method:"GET"})
	.then( p => p.text())
	.then(text => {
		const users = JSON.parse(text)
		users.forEach(manageUser)
	})
}


document.addEventListener("DOMContentLoaded", () => {
	getUsers()
})




