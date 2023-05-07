window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/index.html";
        return;
    }

    try {
        let response = await fetch("http://localhost:5000/api/me", {
            headers: { Authorization: token }
        });

        let data = await response.json();
        const user = data.user;

        if (!user.admin) {
            window.location.href = "index.html";
            return;
        }

        response = await fetch("http://localhost:5000/api/most_viewed");
        data = await response.json();

        const quote = document.getElementById("quote");
        const music = document.getElementById("music");
        const video = document.getElementById("video");
        const emoticon = document.getElementById("emoticon");

        quote.innerText = `"${data.quote.text}"`;
        music.innerText = data.music.title;
        video.innerText = data.video.title;
        const emotion = ["happy", "sad", "angry", "neutral", "nervous"][data.emoticon];

        const img = document.createElement("img");
        img.src = `../images/${emotion}_emoji.jpg`;
        img.classList.remove("invisible");
        img.style.width = `10vw`;

        emoticon.appendChild(img);
    } catch (err) {
        console.error(err);
    }

});
