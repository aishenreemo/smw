const form = document.querySelector("form");
const add = document.querySelector(".add");
const image = document.querySelector(".container img");
let images = [];
let pointer = 0;

add.addEventListener("click", () => form.style.display = "flex");

document.getElementById("prev").addEventListener("click", () => {
    if (images.length == 0) return;

    pointer = pointer == 0 ? images.length - 1 : pointer - 1;

    const imageData = images[pointer];
    image.src = `data:image/jpeg;base64,${arrayBufferToBase64(imageData.data.data)}`;
    image.dataset.id = imageData._id;
});

document.getElementById("next").addEventListener("click", () => {
    if (images.length == 0) return;

    pointer += 1;
    pointer %= images.length;

    const imageData = images[pointer];
    image.src = `data:image/jpeg;base64,${arrayBufferToBase64(imageData.data.data)}`;
    image.dataset.id = imageData._id;
});

document.getElementById("delete").addEventListener("click", async () => {
    if (!image.dataset.id) return;

    await fetch("http://localhost:5000/api/delete_pamphlet", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: image.dataset.id }),
    });

    window.location.href = "pamphlets.html";
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:5000/api/add_pamphlet", {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": token,
            },
        });

        if (response.status === 200) {
            window.location.href = "pamphlets.html";
        }
    } catch (err) {
        console.error(err);
    }
})

window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("http://localhost:5000/api/list_pamphlets");
        images = await response.json();

        if (images.length == 0) return;

        const imageData = images[pointer];
        image.src = `data:image/jpeg;base64,${arrayBufferToBase64(imageData.data.data)}`;
        image.dataset.id = imageData._id;
    } catch (err) {
        console.error(err);
    }
});

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}
