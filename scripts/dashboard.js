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
            const user = JSON.parse(localStorage.getItem("user"));
            window.location.href = user.admin ? "/" : "/?admin=1";
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("global");
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
        let response = await fetch("http://localhost:5000/api/me", {
            headers: { Authorization: token }
        });

        let data = await response.json();
        const user = data.user;
        const global = data.global;
        const content = document.querySelector(".content");

        if (user.username == "admin") {
            document.getElementById("register-btn").style.display = "inline";
        }

        if (!user.admin) {
            document.getElementById("logout").innerText = "Login as Admin";
            document.querySelectorAll(".admin-only").forEach(element => {
                element.classList.add("invisible");
                element.style.display = "none";
            })
        }

        response = await fetch("http://localhost:5000/api/list_words");
        data = await response.json();

        for (const word of data) {
            const div = document.createElement("div");
            div.classList.add("word");
            div.dataset.id = word._id;

            const child = document.createElement("button");
            child.innerText = word.text;
            child.classList.add("text");
            child.onclick = async () => {
                const range = document.createRange();
                range.selectNodeContents(child);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                document.execCommand("copy");
            }

            const del = document.createElement("button");
            del.textContent = '';
            del.classList.add("material-icons");
            del.classList.add("admin-only");
            del.onclick = async () => {
                await fetch("http://localhost:5000/api/delete_word", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ id: word._id }),
                });

                window.location.href = "/dashboard";
            }

            div.appendChild(child);
            if (user.admin) div.appendChild(del);
            content.insertBefore(div, content.firstChild);
        }


        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("global", JSON.stringify(global));
    } catch (err) {
        console.error(err);
    }

});

const registerForm = document.getElementById("register");
const registerErrorMessage = document.getElementById("register-error");
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(registerForm);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
        let response = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            credentials: "include",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password,
                admin: true
            })
        });

        if (response.status !== 200) {
            registerErrorMessage.textContent = "Unable to register user";
            return;
        }

        response = await fetch("http://localhost:5000/api/logout", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (response.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("global");
            window.location.href = "/index.html";
        } else {
            const data = await response.json();
            console.log(data.error);
        }

    } catch (err) {
        console.error(err);
        registerErrorMessage.textContent = "An error occurred";
    }
});

const addForm = document.getElementById("i-word");
addForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(addForm);
    const text = formData.get("text");
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:5000/api/add_word", {
            method: "POST",
            headers: {
                "Authorization": token,
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        if (response.status === 200) {
            window.location.href = "/dashboard";
        }
    } catch (err) {
        console.error(err);
    }
});

document.querySelector(".add").addEventListener("click", () => {
    addForm.style.display = "flex";
});

const content = document.querySelector(".content");
const up = document.querySelector(".up");

up.addEventListener("click", () => {
    content.scrollTop = 0;
});

content.addEventListener("scroll", () => {
    up.style.display = content.scrollTop == 0 ? "none" : "inline";
});
