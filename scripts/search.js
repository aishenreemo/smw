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
    }

    div = document.createElement("div");
    div.textContent = "VIDEOS";
    div.classList.add("title");

    for (const videos of data.videos) {
    }
}

searchStuff();
