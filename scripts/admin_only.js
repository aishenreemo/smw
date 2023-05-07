document.querySelectorAll(".admin-only").forEach(element => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user.admin) {
        element.classList.add("invisible");
        element.style.display = "none";
    }
})
