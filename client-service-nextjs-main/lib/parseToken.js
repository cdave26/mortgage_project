/**
 * Pasrse the token and return the payload
 * @param {String} token
 * @returns {Object} payload
 */
export const parseToken = token => {
	try {
		const base64Url = token.split(".")[1]
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
		return JSON.parse(atob(base64))
	} catch (error) {
		throw new Error("Invalid token")
	}
}
