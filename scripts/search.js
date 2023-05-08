const searchInput = document.querySelector(".search input");
const searchButton = document.querySelector(".search button");
const container = document.querySelector(".container");

searchButton.onclick = () => {
    if (searchInput.value.length == 0) return;

    window.location.href = `/dashboard/search.html?string=${searchInput.value}`;
}

async function searchStuff() {
    if (window.location.pathname != "/dashboard/search.html") return;

    const params = new URLSearchParams(window.location.search);
    const searchString = params.get("string");

    const response = await fetch(`http://localhost:5000/api/search/${searchString}`);
    const data = await response.json();

    let div;
    div = document.createElement("div");
    div.textContent = "QUOTES";
    div.classList.add("title");
    container.appendChild(div);

    for (const quote of data.quotes) {
        const div = document.createElement("div");
        div.classList.add("quote");
        div.dataset.id = quote._id;

        const child = document.createElement("button");
        child.innerText = `"${quote.text}"`;
        child.classList.add("text");
        child.onclick = async () => {
            const range = document.createRange();
            range.selectNodeContents(child);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand("copy");

            await fetch("http://localhost:5000/api/add_view", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: quote._id,
                    type: "Quote",
                })
            });
        }

        const del = document.createElement("button");
        del.textContent = '';
        del.classList.add("material-icons");
        del.classList.add("admin-only");
        del.onclick = async () => {
            await fetch("http://localhost:5000/api/delete_quote", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: quote._id }),
            });

            window.location.href = "quotes.html";
        }

        div.appendChild(child);
        div.appendChild(del);
        container.appendChild(div);
    }

    div = document.createElement("div");
    div.textContent = "MUSICS";
    div.classList.add("title");
    container.appendChild(div);

    for (const music of data.musics) {
        const div = document.createElement("div");
        div.classList.add("music");

        const play = document.createElement("button");
        const del = document.createElement("button");

        play.textContent = "";
        play.dataset.src = music.url;
        play.dataset.id = music._id;
        play.classList.add("play");
        play.onclick = () => window.location.href = `/dashboard/musics.html?v=${play.dataset.id}`;
        del.textContent = "";
        del.dataset.id = music._id;
        del.classList.add("delete");
        del.classList.add("admin-only");

        for (const button of [play, del]) {
            button.classList.add("material-icons");
        }

        const child = document.createElement("a");
        child.innerText = `${music.title} (${formatDuration(music.duration)})`;
        child.classList.add("title");
        child.href = music.link;
        child.target = "_blank";

        div.appendChild(play);
        div.appendChild(child);
        div.appendChild(del);
        container.appendChild(div);
    }

    div = document.createElement("div");
    div.textContent = "VIDEOS";
    div.classList.add("title");
    container.appendChild(div);

    for (const video of data.videos) {
        const div = document.createElement("div");
        div.classList.add("video");

        const play = document.createElement("button");
        const del = document.createElement("button");

        play.dataset.id = video._id;
        play.dataset.src = `https://www.youtube.com/embed/${video.videoId}`;
        play.classList.add("play");
        play.onclick = () => window.location.href = `/dashboard/videos.html?v=${play.dataset.id}`;
        del.textContent = "";
        del.dataset.id = video._id;
        del.classList.add("delete");
        del.classList.add("admin-only");
        del.classList.add("material-icons");

        const thumbnail = document.createElement("img");
        thumbnail.src = video.thumbnail;

        play.appendChild(thumbnail);

        const child = document.createElement("a");
        child.innerText = `${video.title} (${formatDuration(video.duration)})`;
        child.classList.add("title");
        child.href = video.link;
        child.target = "_blank";

        div.appendChild(play);
        div.appendChild(child);
        div.appendChild(del);
        container.appendChild(div);
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user.admin) {
        document.querySelectorAll(".admin-only").forEach(element => {
            element.classList.add("invisible");
            element.style.display = "none";
        });
    }
}

searchStuff();

function formatDuration(duration) {
    let hours = Math.floor(duration / 3600);
    let minutes = Math.floor((duration % 3600) / 60);
    let seconds = duration % 60;

    if (hours < 10) {
        hours = '0' + hours;
    }
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }

    return `${hours}:${minutes}:${seconds}`;
}
