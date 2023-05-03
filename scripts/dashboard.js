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
        // do something to data
    } catch (err) {
        console.error(err);
    }
});
