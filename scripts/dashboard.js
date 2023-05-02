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

        document.getElementById("is-admin").textContent = data.user.admin ? "im an admin" : "im a viewer";
    } catch (err) {
        console.error(err);
    }
});
