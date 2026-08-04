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

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value.trim();

    if (!username || !password) {

        showMessage(
            "Please enter Username and Password."
        );

        return;

    }

    if (!CONFIG.API_URL) {

        showMessage(
            "Apps Script API URL has not been configured."
        );

        return;

    }

    showLoader(true);

    try {

        let ipAddress =
            "Unavailable";

        try {

            const ipResponse =
                await fetch(
                    "https://api64.ipify.org?format=json"
                );

            if (ipResponse.ok) {

                const ipData =
                    await ipResponse.json();

                ipAddress =
                    String(
                        ipData.ip || "Unavailable"
                    ).trim();

            }

        }

        catch (ipError) {

            console.warn(
                "Unable to retrieve IP address:",
                ipError
            );

        }

        const userAgent =
            navigator.userAgent || "Unavailable";

        const browserInfo =
            detectBrowser(userAgent);

        const osInfo =
            detectOperatingSystem(userAgent);

        const deviceInfo =
            detectDevice(userAgent);

        const url =

            CONFIG.API_URL +

            "?action=login" +

            "&username=" +
            encodeURIComponent(username) +

            "&password=" +
            encodeURIComponent(password) +

            "&ipAddress=" +
            encodeURIComponent(ipAddress) +

            "&browser=" +
            encodeURIComponent(browserInfo) +

            "&os=" +
            encodeURIComponent(osInfo) +

            "&device=" +
            encodeURIComponent(deviceInfo) +

            "&userAgent=" +
            encodeURIComponent(userAgent) +

            "&t=" +
            Date.now();

        const response =
            await fetch(url);

        const data =
            await response.json();

        showLoader(false);

        if (!data.success) {

            showMessage(data.message);

            return;

        }

        const session = {

            username:
                data.username,

            role:
                data.role,

            name:
                data.name,

            college:
                data.college,

            assignedLCA:
                data.assignedLCA,

            referralCode:
                data.referralCode,

            referralCount:
                data.referralCount,

            loginTime:
                Date.now()

        };

        localStorage.setItem(
            "SHEIN_SESSION",
            JSON.stringify(session)
        );

        switch (data.role) {

            case "ADMIN":

                window.location.href =
                    "dashboard-admin.html";

                return;

            case "LCA":

                window.location.href =
                    "dashboard-lca.html";

                return;

            case "CA":

                window.location.href =
                    "dashboard-ca.html";

                return;

            default:
                localStorage.removeItem(
                    "SHEIN_SESSION"
                );
                showMessage(
                    "Unknown user role."
                );
                return;
        }
    }

    catch (error) {
        showLoader(false);
        console.error(error);
        showMessage(
            "Unable to connect to the server."
        );
    }
}

function detectBrowser(userAgent) {

    const ua =
        String(userAgent || "");

    let match;

    if ((match = ua.match(/Edg\/([\d.]+)/))) {
        return "Microsoft Edge " + match[1];
    }

    if ((match = ua.match(/OPR\/([\d.]+)/))) {
        return "Opera " + match[1];
    }

    if ((match = ua.match(/CriOS\/([\d.]+)/))) {
        return "Chrome iOS " + match[1];
    }

    if ((match = ua.match(/Chrome\/([\d.]+)/))) {
        return "Chrome " + match[1];
    }

    if ((match = ua.match(/FxiOS\/([\d.]+)/))) {
        return "Firefox iOS " + match[1];
    }

    if ((match = ua.match(/Firefox\/([\d.]+)/))) {
        return "Firefox " + match[1];
    }

    if (
        ua.includes("Safari") &&
        (match = ua.match(/Version\/([\d.]+)/))
    ) {
        return "Safari " + match[1];
    }

    return "Unknown Browser";

}


function detectOperatingSystem(userAgent) {

    const ua =
        String(userAgent || "");

    if (/Windows NT 10.0/.test(ua)) {
        return "Windows 10/11";
    }

    if (/Windows NT 6.3/.test(ua)) {
        return "Windows 8.1";
    }

    if (/Windows NT 6.1/.test(ua)) {
        return "Windows 7";
    }

    if (/Android/.test(ua)) {

        const match =
            ua.match(/Android\s([\d.]+)/);

        return match
            ? "Android " + match[1]
            : "Android";

    }

    if (/iPhone|iPad|iPod/.test(ua)) {

        const match =
            ua.match(/OS\s([\d_]+)/);

        return match
            ? "iOS " + match[1].replace(/_/g, ".")
            : "iOS";

    }

    if (/Mac OS X/.test(ua)) {

        const match =
            ua.match(/Mac OS X\s([\d_]+)/);
        return match
            ? "macOS " + match[1].replace(/_/g, ".")
            : "macOS";

    }
    if (/Linux/.test(ua)) {
        return "Linux";
    }
    return "Unknown OS";
}

function detectDevice(userAgent) {
    const ua =
        String(userAgent || "");
    if (/iPad|Tablet/.test(ua)) {
        return "Tablet";
    }
    if (/Mobi|Android|iPhone|iPod/.test(ua)) {
        return "Mobile";
    }
    return "Desktop";
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

        switch (session.role) {

            case "ADMIN":
                window.location.href = "dashboard-admin.html";
                return;

            case "LCA":
                window.location.href = "dashboard-lca.html";
                return;

            case "CA":
                window.location.href = "dashboard-ca.html";
                return;

            default:
                localStorage.removeItem("SHEIN_SESSION");
                return;

        }

    }

    catch (e) {

        localStorage.removeItem("SHEIN_SESSION");

    }

})();
