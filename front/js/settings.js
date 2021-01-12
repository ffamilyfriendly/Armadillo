const status = (b, t = 1000 * 5) => {
	let cl = ""
	if(b) {
		cl = "pass_updateDone"
	} else {
		cl = "pass_updateFailed"
	}
	document.getElementById(cl).classList.remove("hide")
	setTimeout(() => { document.getElementById(cl).classList.add("fadeOut") }, t-2000)
	setTimeout(() => { document.getElementById(cl).classList.add("hide") }, t)
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
		if(!res.ok) return status(false)
		else return status(true)
	})
	.catch(err => {
		document.getElementById("pass_updateFailed").classList.remove("hide")
	})

}

document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("changePassForm").addEventListener("submit",doChangePass)
})
