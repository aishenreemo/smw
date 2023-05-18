const form = document.querySelector("form");
const source = document.querySelector("audio");
const add = document.querySelector(".add");
const container = document.querySelector(".container");

add.addEventListener("click", () => form.style.display = "flex");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    form.style.display = "none";

    const formData = new FormData(form);
    const link = formData.get("url");
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:5000/api/add_music", {
            method: "POST",
            body: JSON.stringify({ link }),
            headers: {
                "Authorization": token,
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
        });

        if (response.status === 200) {
            window.location.href = "musics.html";
        }
    } catch (err) {
        console.error(err);
    }
});

window.addEventListener("DOMContentLoaded", async () => {
    try {
        const user = JSON.parse(localStorage.getItem("user"));

        const response = await fetch("http://localhost:5000/api/list_musics");
        const data = (await response.json());

        for (const music of data) {
            const div = document.createElement("div");
            div.classList.add("music");

            const play = document.createElement("button");
            const del = document.createElement("button");

            play.textContent = "";
            play.dataset.src = music.url;
            play.dataset.id = music._id;
            play.classList.add("play");
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

        const params = new URLSearchParams(window.location.search);
        const id = params.get("v");

        document.querySelectorAll("button.play").forEach(button => {
            button.onclick = async () => {
                await fetch("http://localhost:5000/api/add_view", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: button.dataset.id,
                        type: "Music",
                    })
                });

                source.pause();
                source.src = button.dataset.src;
                source.play();

                fetch("https://cors-anywhere.herokuapp.com/" + button.dataset.src, { headers: { Origin: null } }).then(async response => {
                    if (response.status == 403) {
                        const res = await fetch("http://localhost:5000/api/update_music", {
                            method: "POST",
                            headers: {
                                "Accept": "application/json",
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ id: button.dataset.id }),
                        });
                        source.pause();
                        source.src = await res.json();
                        await source.play();
                    }

                }).catch(_ => {});
            };

            if (button.dataset.id == id) button.click();
        });

        document.querySelectorAll("button.delete").forEach(button => {
            button.addEventListener("click", async () => {
                await fetch("http://localhost:5000/api/delete_music", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ id: button.dataset.id }),
                });

                window.location.href = "musics.html";
            });
        });

        if (!user.admin) {
            document.querySelectorAll(".admin-only").forEach(element => {
                element.classList.add("invisible");
                element.style.display = "none";
            });
        }

    } catch (err) {
        console.error(err);
    }

});

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

const content = document.querySelector(".container");
const up = document.querySelector(".up");

up.addEventListener("click", () => {
    content.scrollTop = 0;
});

content.addEventListener("scroll", () => {
    up.style.display = content.scrollTop == 0 ? "none" : "inline";
});

