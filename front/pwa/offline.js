/*

    _e.waitUntil(caches.open("armadillo").then(function (cache) {
        return cache.addAll(FILES_TO_CACHE);
    }));

*/

let video = document.createElement("video")
let mst

const doVideoStuff = () => {
	video = document.getElementById("mainVideo")

	video.onplay = () => {
		console.log("mst",mst)
		if(mst.stamp && mst.stamp.time > 1) {
			if(confirm(`do you want to continue where you last left off?`)) {
				video.currentTime = mst.stamp.time
			}
		}
		video.onplay = null
	}
}

document.addEventListener("DOMContentLoaded", () => {
	setTimeout(() => {
		const mlist = document.getElementById("movielist")
		mlist.innerHTML = ""
		getAllKeys()
		.then(movies => {
			movies.forEach(movie => {
				const mItem = document.createElement("div")
				mItem.classList = "surface padding-medium margin-medium"
				mItem.onclick = () => {
					const container = document.getElementById("player")
					container.classList.remove("hide")

					movie.getUrl()
					.then(u => {
						container.innerHTML = `
							<video id="mainVideo" class="surface" controls>
								<source src="${u}">
							</video>
						`
						movie.meta().then(m => {
							mst = m
							doVideoStuff()
						})
					})
				}
				movie.meta()
				.then(m => {
					console.log(m)
					mItem.innerHTML = `
						${m.meta.thumbnail ? `<img class="thumbnail" src="${m.meta.thumbnail.startsWith("/") ? `https://image.tmdb.org/t/p/w500/${m.meta.thumbnail}` : m.meta.thumbnail}">` : ""}
						<div class="text-content">
							<h3 class="title">${m.meta.fullname||m.meta.base.displayname}</h3>
							${m.meta.description ? `<p class="description">${m.meta.description}</p>` : ""}
							<h4 class="progress">${Math.round((m.stamp.time / m.stamp.max) * 100)}%</h4>
						</div>
						<div onclick="resolveDeletion('${movie.id}'); location.reload()" class="remove-content">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"/></svg>
						</div>
					`
				})
				mlist.append(mItem)
			})
		})
	},500)
})