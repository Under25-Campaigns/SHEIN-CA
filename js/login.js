const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const messageBox = document.getElementById("message");
const loader = document.getElementById("loader");
const loginButton = document.getElementById("loginButton");

usernameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") login();
});

passwordInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") login();
});

function showLoader(show) {

    loader.classList.toggle("hidden", !show);

    loginButton.disabled = show;

    loginButton.style.opacity = show ? "0.6" : "1";

}

function showMessage(text, success = false) {

    messageBox.innerHTML = text;

    messageBox.style.color = success ? "#b9ffd0" : "#ffb7b7";

}

async function login() {

    showMessage("");

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {

        showMessage("Please enter Username and Password.");

        return;

    }

    if (!CONFIG.API_URL) {

        showMessage("Apps Script API URL has not been configured.");

        return;

    }

    showLoader(true);

    try {

        const url =
            CONFIG.API_URL +
            "?action=login" +
            "&username=" + encodeURIComponent(username) +
            "&password=" + encodeURIComponent(password);

        const response = await fetch(url);

        const data = await response.json();

        showLoader(false);

        if (!data.success) {

            showMessage(data.message);

            return;

        }

        const session = {

            username: data.username,

            role: data.role,

            name: data.name,

            college: data.college,

            assignedLCA: data.assignedLCA,

            loginTime: Date.now()

        };

        localStorage.setItem(
            "SHEIN_SESSION",
            JSON.stringify(session)
        );

        if (data.role === "CA") {

            window.location.href = "dashboard-ca.html";

            return;

        }

        if (data.role === "LCA") {

            window.location.href = "dashboard-lca.html";

            return;

        }

        showMessage("Unknown user role.");

    }

    catch (error) {

        showLoader(false);

        console.error(error);

        showMessage("Unable to connect to the server.");

    }

}

(function () {

    const raw = localStorage.getItem("SHEIN_SESSION");

    if (!raw) return;

    try {

        const session = JSON.parse(raw);

        if (!session.role) {

            localStorage.removeItem("SHEIN_SESSION");

            return;

        }

        if (session.role === "CA") {

            window.location.href = "dashboard-ca.html";

            return;

        }

        if (session.role === "LCA") {

            window.location.href = "dashboard-lca.html";

            return;

        }

    }

    catch (e) {

        localStorage.removeItem("SHEIN_SESSION");

    }

})();
