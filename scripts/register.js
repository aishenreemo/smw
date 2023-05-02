const registerForm = document.getElementById("register");
const registerErrorMessage = document.getElementById("register-error");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(registerForm);
    const username = formData.get("username");
    const password = formData.get("password");

    const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        credentials: "include",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    if (response.status === 200) {
        window.location.href = "dashboard.html";
    } else {
        registerErrorMessage.textContent = "Unable to register user";
    }
});
