const defaultSettings = {
	chunkSize: 52428800, //50mb
	debug: false,
	onready: null
}

const cobj = {
	total:null,
	loaded:0,
	segments:0,
	totalSegments:null,
	isFirst:true,
	done:false,
	name:null,
	type:""
}

class VS {
	/**
	 * 
	 * @param {Object} settings configuration
	 */
	constructor(settings = defaultSettings) {
		const createObjectStore = (t) => {
			this.db = t
			t.onerror = (err) => console.error("[Video-Js] ", err)

			this.db.createObjectStore("Video-Storage")
			console.log("[Video-Storage] Database initiated!")
		}
		this.req = window.indexedDB.open("Video-Storage", 4)
		this.req.onupgradeneeded = (e) => createObjectStore(e.target.result) 
		this.req.onsuccess = (e) => {
			this.db = this.req.result
			this.db.onerror = (err) => { console.error("[Video-Js] ", err) }
			if(this.db.setVersion) {
				if(this.db.version != dbVersion) {
					const setVersion = this.db.setVersion(dbVersion)
					setVersion.onsuccess = () => { createObjectStore(this.db) }
				}
			}
			if(this.conf.onready) this.conf.onready()
		}

		this.conf = settings

		this.onprogress = null
		this.onready = null

		this.c = Object.assign({}, cobj)
	}

	/**
	 * @description FOR INTERNAL USE!
	 * @param {String} name 
	 * @param {*} data 
	 */
	_save(name,data,callback) {
		let transaction = this.db.transaction(["Video-Storage"],"readwrite")
		transaction.objectStore("Video-Storage").put(data,name)
		transaction.oncomplete = callback ? callback : null
	}

	/**
	 * @description deletes all data - be carefull!
	 */
	deleteAll(callback) {
		this.db.close()
		const reqq = window.indexedDB.deleteDatabase("Video-Storage")

		if(callback) {
			reqq.onsuccess = callback
			reqq.onerror = callback
			reqq.onblocked = callback
		}
	}

	_doReq(url, onDone) {
		const xhr = new XMLHttpRequest;
		xhr.responseType = "blob"
		xhr.open("GET", url, true)
		let logObj = {
			getting:`getting bytes=${this.c.loaded}-${this.c.loaded+this.conf.chunkSize}`
		}

		if(!this.c.isFirst && this.c.total < this.c.loaded + this.conf.chunkSize) {
			if(this.conf.debug) console.log("TOO BIG")
			xhr.setRequestHeader("Range",`bytes=${this.c.loaded}-${this.c.total}`)
			logObj.getting = `getting bytes=${this.c.loaded}-${this.c.loaded+this.c.total}`
		} else xhr.setRequestHeader("Range",`bytes=${this.c.loaded}-${this.c.loaded+this.conf.chunkSize}`)
		
		
		xhr.onreadystatechange = () => {
			if(xhr.readyState != 4) return
		}

		xhr.onload = () => {
			logObj.got = xhr.getResponseHeader("Content-Range")
			if(this.c.isFirst) {
				this.c.total = Number(xhr.getResponseHeader("Content-Range").split("/")[1])
				this.c.totalSegments = Math.ceil(this.c.total / this.conf.chunkSize)
				this.c.isFirst = false
				this.c.type = xhr.response.type
			}

			this.c.loaded += xhr.response.size

			if(this.conf.debug) console.log(logObj)

			if(this.onprogress) this.onprogress()
			if(this.conf.debug) console.log(`% loaded ${(this.c.loaded / this.c.total * 100).toFixed(2)}`)

			this._save(`blob_${this.c.name}_${this.c.segments}`, new Blob([xhr.response]), () => {
				this.c.segments++
				if(this.c.loaded < this.c.total) this._doReq(url,onDone)
				else {
					this.c.done = true
					onDone()
				}
			})
		}

		xhr.send(null)
	}

	get(name) {
		return new Promise((resolve,reject) => {
			let tra = this.db.transaction(["Video-Storage"],"readwrite")
			tra.objectStore("Video-Storage").get(`meta_${name}`).onsuccess = (e) => {
				const result = e.target.result
				if(!result) reject("not found")
				else {
					const returnObj = {
						chunkSize: result.chunkSize,
						total: result.total,
						segments: result.totalSegments,
						getBlobs: () => {
							return new Promise((resolve,reject) => {
								let blobArray = []
								for(let i = 0; i < result.totalSegments; i++) {
									tra.objectStore("Video-Storage").get(`blob_${name}_${i}`).onsuccess = (e) => {
										blobArray.push(e.target.result)
										if(i+1 === result.totalSegments) {
											resolve(new Blob(blobArray,{ type:result.type }))
										}
									}
								}
							})
						},
						getBlob: (n) => {
							return new Promise((resolve,reject) => {
								if(n > result.totalSegments) reject(`${n} > ${result.totalSegments}.`)
								else {
									tra.objectStore("Video-Storage").get(`blob_${name}_${n}`).onsuccess = (e) => {
										resolve(e.target.result)
									}
								}
							})
						},
						getUrl: async () => {
							const blobs = await returnObj.getBlobs()
							return { url: URL.createObjectURL(blobs), type:blobs.type}
						}
					}
					resolve( returnObj )
				} 
			}
		})
	}

	/**
	 * 
	 * @param {String} name the name of the file
	 * @param {String} path the path of the origin file
	 */
	save(name,path,callback) {
		this.c.name = name
		this._doReq(path, () => {
			if(this.conf.debug) console.log("DONE!")
			this.c.chunkSize = this.conf.chunkSize
			this._save(`meta_${name}`,this.c,(e) => {
				console.log(e)
				if(callback) callback()
			})
			this.c = Object.assign({}, cobj)
		})
	}

	/**
	 * @description INTERNAL FUNCTION
	 * @param {String} name 
	 */
	_delete(name) {
		let tra = this.db.transaction(["Video-Storage"],"readwrite")
		tra.objectStore("Video-Storage").delete(name)
	}

	/**
	 * @description removes all associated records of file
	 * @param {String} name name of file to remove
	 */
	delete(name) {
		this.get(name)
		.then(v => {
			for(let i = 0; i < v.segments; i++) {
				this._delete(`blob_${name}_${i}`)
			}
			this._delete(`meta_${name}`)
		})
	}

}

VS.getDefaultConfig = () => { return Object.assign({}, defaultSettings) }

VS.isFirefox = () => {
	return navigator.userAgent.search("Firefox") > -1
}

const doSeek = (mediaElement) => {
	if(!mediaElement.duration) return
	console.log("set")
	mediaElement.currentTime = mediaElement.duration
}

/**
 * @description I am sorry for this code. It's a disgrace but itworks™
 * @param {HTMLMediaElement} mediaElement 
 */
VS.lazyLoad = (mediaElement,callback) => {
	const loadInterval = setInterval(() => {
		doSeek(mediaElement)
		if(mediaElement.duration - mediaElement.currentTime < 10) {
			clearInterval(loadInterval)			
			mediaElement.currentTime = 1
			callback ? callback() : null
		}
	},500)
}