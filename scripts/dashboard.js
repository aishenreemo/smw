document.getElementById("logout").addEventListener("click", async () => {
    try {
        const response = await fetch("http://localhost:5000/api/logout", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (response.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("data");
            window.location.href = "/index.html";
        } else {
            const data = await response.json();
            console.log(data.error);
        }
    } catch (err) {
        console.error(err);
    }
});

document.getElementById("menu").addEventListener("click", async () => {
    const options = document.querySelector(".menu > .options");

    if (options.classList.contains("invisible")) {
        options.classList.remove("invisible");
    } else {
        options.classList.add("invisible");
    }

});

window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/index.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/me", {
            headers: { Authorization: token }
        });

        const data = await response.json();
        const user = data.user;
        const global = data.global;

        const textarea = document.querySelector("textarea");
        textarea.value = global.word;

        if (user.admin) {
            textarea.readOnly = false;
            textarea.onchange = async () => {
                global.word = textarea.value;
                await fetch("http://localhost:5000/api/update_global", {
                    method: "POST",
                    body: JSON.stringify({ global }),
                    headers: {
                        "Authorization": token,
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                });
            }
        }

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("global", JSON.stringify(global));
    } catch (err) {
        console.error(err);
    }

});
