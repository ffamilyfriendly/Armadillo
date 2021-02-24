/*	this file manages downloading/indexing/deleting offline content.
*	the goal is to achive this through indexedDB storing content as blobs.
*	I've never coded anything like with indexedDB nor blobs so this will be interesting...
*/

let request = window.indexedDB.open("offline", 4),
	db,
	fS

const createObjectStore = (t) => {

	db = t
	t.onerror = function(event) {
	  alert("error loading database!")
	};
  
	db.createObjectStore("offline");
}

// This handler is called when a new version of the database
// is created, either when one has not been created before
// or when a new version number is submitted by calling
// window.indexedDB.open().
// This handler is only supported in recent browsers.
request.onupgradeneeded = function(event) {
  createObjectStore(event.target.result)
};

request.onsuccess = function (event) {
    console.log("[DLMANAGER] Success creating/accessing IndexedDB database");
    db = request.result;

    db.onerror = function (event) {
        console.log("[DLMANAGER] Error creating/accessing IndexedDB database");
    };
    
    // Interim solution for Google Chrome to create an objectStore. Will be deprecated
    if (db.setVersion) {
        if (db.version != dbVersion) {
            var setVersion = db.setVersion(dbVersion);
            setVersion.onsuccess = function () {
                createObjectStore(db);
            };
        }
    }
}

const saveToDb = (blob,name) => {
	console.log(`[DLMANAGER] saving content with size ${Math.round(blob.size/1000)}kb as ${name}`)
	let transaction = db.transaction(["offline"], "readwrite");
	transaction.objectStore("offline").put(blob, `raw_${name}`)
}

const saveMetaToDb = (data,name) => {
	console.log(`[DLMANAGER] saving meta as ${name}`)
	let transaction = db.transaction(["offline"], "readwrite");
	transaction.objectStore("offline").put(data, name);
}

const resolveDeletion = (t) => {
	let transaction = db.transaction(["offline"], "readwrite");
	transaction.objectStore("offline").delete(t)

	let t2 = db.transaction(["offline"], "readwrite");
	t2.objectStore("offline").delete(`raw_${t}`)
}

const getKey = (key) => {
	return new Promise((resolve,reject) => {
		let transaction = db.transaction(["offline"],"readwrite")
		transaction.objectStore("offline").get(key).onsuccess = (event) => {
			console.log(event)
			resolve(event.target.result)
		}
	})
}

const resolveUrl = (t) => {
	return new Promise((resolve,reject) => {
		getKey(`raw_${t}`)
		.then(p => {
			console.log(`[DLMANAGER] got media!`);
			var imgURL = URL.createObjectURL(p);
			resolve(imgURL)
		})
	})
}

const getAllKeys = () => {
	return new Promise((resolve, reject) => {
		let transaction = db.transaction(["offline"],"readwrite")
		transaction.objectStore("offline").getAllKeys().onsuccess = (event) => {
			resolve(event.target.result.filter(t => !t.startsWith("raw_")).map(t => {
				return {
					id:t,
					delete: () => resolveDeletion(t),
					getUrl: () => resolveUrl(t),
					meta: () => getKey(t)
				}
			}))
		}
	})
}

const handleProg = (ev) => {
	console.log(ev)
	const pc = Math.round(ev.loaded / ev.total * 100)
	document.getElementById("isPwa_progress").style.width = `${pc}%`
}

const saveContent = (url,name) => {
	// Create XHR
	var xhr = new XMLHttpRequest(),
	blob;

	xhr.open("GET", url, true);
	// Set the responseType to blob
	xhr.responseType = "blob";

	xhr.onprogress = handleProg

	xhr.addEventListener("load", function () {
	if (xhr.status === 200) {
			console.log("[DLMANAGER] Content downloaded");
			
			// File as response
			blob = xhr.response;

			// Put the received blob into IndexedDB
			saveToDb(blob,name);
	}
	}, false);

	// Send XHR
	xhr.send();
}