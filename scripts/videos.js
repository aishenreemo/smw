const form = document.querySelector("form");
const source = document.querySelector("iframe");
const add = document.querySelector(".add");
const container = document.querySelector(".container .list");

add.addEventListener("click", () => form.style.display = "flex");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    form.style.display = "none";

    const formData = new FormData(form);
    const link = formData.get("url");
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:5000/api/add_video", {
            method: "POST",
            body: JSON.stringify({ link }),
            headers: {
                "Authorization": token,
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
        });

        if (response.status === 200) {
            window.location.href = "videos.html";
        }
    } catch (err) {
        console.error(err);
    }
});

window.addEventListener("DOMContentLoaded", async () => {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user.admin) {
            document.querySelectorAll(".admin-only").forEach(element => {
                element.classList.add("invisible");
                element.style.display = "none";
            });
        }

        const response = await fetch("http://localhost:5000/api/list_videos");
        const data = await response.json();

        for (const video of data) {
            const div = document.createElement("div");
            div.classList.add("video");

            const play = document.createElement("button");
            const del = document.createElement("button");

            play.dataset.id = video._id;
            play.dataset.src = `https://www.youtube.com/embed/${video.videoId}`;
            play.classList.add("play");
            del.textContent = "";
            del.dataset.id = video._id;
            del.classList.add("delete");
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

            document.querySelectorAll("button.play").forEach(button => {
                button.addEventListener("click", async () => {
                    source.src = button.dataset.src;

                    await fetch("http://localhost:5000/api/add_view", {
                        method: "POST",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            id: button.dataset.id,
                            type: "Video",
                        })
                    });

                });
            });

            document.querySelectorAll("button.delete").forEach(button => {
                button.addEventListener("click", async () => {
                    await fetch("http://localhost:5000/api/delete_video", {
                        method: "POST",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ id: button.dataset.id }),
                    });

                    window.location.href = "videos.html";
                });
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
