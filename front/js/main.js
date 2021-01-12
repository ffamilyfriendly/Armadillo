const armadillo = {
	user:{}
}

document.addEventListener("DOMContentLoaded", () => {
	if(localStorage.getItem("loggedIn")) {
		fetch("/me", { method:"GET" })
		.then(res => res.text().then(t => armadillo.user = JSON.parse(t)))
	}
})