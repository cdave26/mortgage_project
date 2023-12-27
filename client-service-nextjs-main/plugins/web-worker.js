/**
 * Web Worker
 * Performs heavy tasks in the background
 */

self.addEventListener("message", event => {
	const { type, message } = event.data

	let result = null

	switch (type) {
		default:
			break
	}

	self.postMessage({ type, result })
})
