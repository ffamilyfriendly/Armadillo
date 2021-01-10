exports.r_params = (c_params) => {
	for(let i = 0; i < c_params.length; i++) {
		if(typeof c_params[i] == "undefined") return true
	}
	return false
}