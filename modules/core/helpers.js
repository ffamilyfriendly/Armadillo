exports.r_params = (c_params) => {
	for(let i = 0; i < c_params.length; i++) {
		if(typeof c_params[i] == "undefined") return true
	}
	return false
}

exports.http_codes = {
	OK: 200,
	Created: 201,
	Accepted: 202,
	Bad_Request: 400,
	Unauthorized: 401,
	Forbidden: 403,
	Not_Found: 404,
	Internal_error:500,
	Not_implemented:501,
	
}