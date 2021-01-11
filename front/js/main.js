const armadillo = {
	user:{}
}

document.addEventListener("DOMContentLoaded", () => {
	if(localStorage.getItem("loggedIn")) {
		fetch("/me", { method:"GET" })
		.then(res => console.log(res))
	}
})