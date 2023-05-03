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
        form.dataset.emotion = imgIndex;
        form.style.display = "flex";
    }
}

function generateDeleteListener(id) {
    return async () => {
        await fetch("http://localhost:5000/delete_quote", {
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
    const emotion = ["happy", "sad", "angry", "neutral"][imgIndex];
    const img = document.querySelector(".main .selected-image");
    const button = document.querySelector(".main .add");

    img.src = `../images/${emotion}_emoji.jpg`;
    img.classList.remove("invisible");

    button.classList.remove("invisible");
    button.addEventListener("click", generateButtonListener(imgIndex));
    document.querySelector(".main .choices").style.display = "none";
    for (const element of document.querySelectorAll(".main .content")) {
        element.classList.add("invisible");
    }

    const container = document.querySelector(".main .container");
    container.classList.remove("invisible");

    const response = await fetch(`http://localhost:5000/api/list_quotes/${imgIndex}`);
    const data = await response.json();
    console.log(data);

    for (const quote of data) {
        const div = document.createElement("div");
        div.classList.add("quote");
        div.dataset.id = quote._id;

        const child = document.createElement("div");
        child.innerText = `"${quote.text}"`;
        child.classList.add("text")

        const del = document.createElement("button");
        del.textContent = '';
        del.classList.add("material-icons");
        del.onclick = generateDeleteListener(quote._id);

        const favorite = document.createElement("button");
        favorite.textContent = '';
        favorite.classList.add("material-icons");

        div.appendChild(child);
        div.appendChild(favorite);
        div.appendChild(del);
        container.appendChild(div);
    }
}
