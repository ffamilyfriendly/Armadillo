if("serviceWorker" in navigator) {
	navigator.serviceWorker.register(`/service-worker.js?random=${Date.now()}`, { registrationStrategy:"registerImmediately" })
	.then(reg => {
		console.log(`[WORKER] registration successfull! Scope: ${reg.scope}`)
	})
	.catch(err => {
		console.warn(`[WORKER] could not register. err: `, err)
	})
}