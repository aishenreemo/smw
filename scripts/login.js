const loginForm = document.getElementById("login");
const loginErrorMessage = document.getElementById("login-error");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
        const response = await fetch(`http://localhost:5000/api/login`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password }),
            credentials: "include"
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            window.location.href = "/dashboard/index.html";
        } else {
            const data = await response.json();
            loginErrorMessage.textContent = data.error;
        }
    } catch (err) {
        console.error(err);
        loginErrorMessage.textContent = "An error occurred";
    }
});

