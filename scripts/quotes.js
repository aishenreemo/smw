const form = document.querySelector(".main form");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const text = formData.get("text");
    const emotion = form.dataset.emotion;
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:5000/api/add_quote", {
            method: "POST",
            headers: {
                "Authorization": token,
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text,
                emotion
            })
        });

        if (response.status === 200) {
            window.location.href = "quotes.html";
        }
    } catch (err) {
        console.error(err);
    }
});

function generateButtonListener(imgIndex) {
    return () => {
        form.style.display = "flex";
        form.dataset.emotion = imgIndex;
    }
}

function generateDeleteListener(id) {
    return async () => {
        await fetch("http://localhost:5000/api/delete_quote", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id }),
        });

        window.location.href = "quotes.html";
    }
}

window.select = async (imgIndex) => {
    const token = localStorage.getItem("token");
    const emotion = ["happy", "sad", "angry", "neutral", "nervous"][imgIndex];
    const img = document.querySelector(".main .selected-image");
    const button = document.querySelector(".main .add");
    const global = JSON.parse(localStorage.getItem("global"));
    const user = JSON.parse(localStorage.getItem("user"));

    global.emoticonCount[emotion] += 1;
    localStorage.setItem("global", JSON.stringify(global));

    await fetch("http://localhost:5000/api/update_global", {
        method: "POST",
        body: JSON.stringify({ global }),
        headers: {
            "Authorization": token,
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
    });

    img.src = `../images/${emotion}_emoji.jpg`;
    img.classList.remove("invisible");

    if (user.admin) {
        button.classList.remove("invisible");
    }

    button.addEventListener("click", generateButtonListener(imgIndex));
    document.querySelector(".main .choices").style.display = "none";
    for (const element of document.querySelectorAll(".main .content")) {
        element.classList.add("invisible");
    }

    const container = document.querySelector(".main .container");
    container.classList.remove("invisible");

    const response = await fetch(`http://localhost:5000/api/list_quotes/${imgIndex}`);
    const data = await response.json();

    for (const quote of data) {
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
        del.onclick = generateDeleteListener(quote._id);

        div.appendChild(child);
        div.appendChild(del);
        container.appendChild(div);
    }

    if (!user.admin) {
        document.querySelectorAll(".admin-only").forEach(element => {
            element.classList.add("invisible");
            element.style.display = "none";
        });
    }
}
