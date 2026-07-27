let SESSION = null;
let CREATORS = [];
let CURRENT_CREATOR = null;
let CURRENT_REEL = null;

/* ===========================================================
   INITIALIZE
=========================================================== */

window.addEventListener("load", () => {
    validateSession();
});

/* ===========================================================
   SESSION
=========================================================== */

function validateSession() {
    const raw = localStorage.getItem("SHEIN_SESSION");
    if (!raw) {
        location.href = "index.html";
        return;
    }
    SESSION = JSON.parse(raw);
    if (SESSION.role !== "CA") {
        location.href = "index.html";
        return;
    }
    document.getElementById("welcomeText").innerHTML =
        "Welcome, " + SESSION.name;
    loadDashboard();
}

function logout() {
    localStorage.removeItem("SHEIN_SESSION");
    location.href = "index.html";
}


/* ===========================================================
   LOAD DASHBOARD
=========================================================== */

async function loadDashboard() {

    try {
        const response = await fetch(
            CONFIG.API_URL +
            "?action=getCAOverview" +
            "&assignedCA=" +
            encodeURIComponent(SESSION.name)
        );
        const data = await response.json();
        if (!data.success) {
            alert(data.message);
            return;
        }
        CREATORS = data.creators;
        renderDashboard();
    }
    catch (err) {
        console.error(err);
        alert("Unable to connect.");
    }
}


/* ===========================================================
   RENDER
=========================================================== */

function renderDashboard() {
    document.getElementById("totalCreators").innerHTML =
        CREATORS.length;
    let reel1 = 0;
    let reel2 = 0;
    let reel3 = 0;
    CREATORS.forEach(c => {
        if (c.reel1.exists) reel1++;
        if (c.reel2.exists) reel2++;
        if (c.reel3.exists) reel3++;
    });
    document.getElementById("reel1Count").innerHTML = reel1;
    document.getElementById("reel2Count").innerHTML = reel2;
    document.getElementById("reel3Count").innerHTML = reel3;
    renderCreatorCards(CREATORS);
}


/* ===========================================================
   SEARCH
=========================================================== */
document
.getElementById("searchCreators")
.addEventListener(
    "input",
    function () {
        const q =
            this.value
            .trim()
            .toLowerCase();
        const filtered =
            CREATORS.filter(c =>
                c.name
                .toLowerCase()
                .includes(q)
                ||
                c.instagram
                .toLowerCase()
                .includes(q)
            );
        renderCreatorCards(filtered);
    }
);

/* ===========================================================
   CREATOR CARD RENDERING
=========================================================== */

function renderCreatorCards(list) {
    const container =
        document.getElementById("creatorContainer");
    container.innerHTML = "";
    const template =
        document.getElementById("creatorTemplate");
    list.forEach(creator => {
        const node =
            template.content.cloneNode(true);
        const card =
            node.querySelector(".creatorCard");
        card.dataset.creatorID =
            creator.creatorID;
        node.querySelector(".creatorName").innerHTML =
            creator.name;
        const insta =
            node.querySelector(".creatorInstagram");
        insta.innerHTML =
            "@" + creator.instagram;
        insta.href =
            "https://instagram.com/" +
            creator.instagram;
        const reel1 =
            node.querySelector(".reel1");
        const reel2 =
            node.querySelector(".reel2");
        const reel3 =
            node.querySelector(".reel3");
     reel1.innerHTML =
    reelHTML(creator, creator.reel1,1);
reel2.innerHTML =
    reelHTML(creator, creator.reel2,2);
reel3.innerHTML =
    reelHTML(creator, creator.reel3,3);
        container.appendChild(node);
    });
}


/* ===========================================================
   REEL HTML
=========================================================== */

function reelHTML(creator, reel, reelNumber) {
    if (reel.exists) {
        let badge = "";
        if (reel.status === "APPROVED") {
            badge =
                "<span class='status approved'>Approved</span>";
        }
        else if (reel.status === "PENDING") {
            badge =
                "<span class='status pending'>Pending Approval</span>";
        }
        else {
            badge =
                "<span class='status rejected'>Rejected</span>";
        }

        return `
        <div class="reelRowContent">
            <div>
                <div class="reelHeading">
                    Reel ${reel.reelNumber}
                </div>
                ${badge}
            </div>
            <div class="reelActions">
                <a
                    href="${reel.link}"
                    target="_blank"
                    class="viewButton"
                >
                    View Reel
                </a>
            </div>
        </div>
        `;
    }

    return `

    <div class="reelRowContent">
        <div>
            <div class="reelHeading">
                Reel ${reel.reelNumber}
            </div>
            <span class="status notSubmitted">
                Not Submitted
            </span>
        </div>
        <div>
            <button
                class="submitButton"
                onclick="openReelModal(
                '${creator.creatorID}',
                ${reel.reelNumber}
                )"
            >
                Submit Reel
            </button>
        </div>
    </div>
    `;
}


/* ===========================================================
   EXPAND / COLLAPSE
=========================================================== */

function toggleCreator(header) {
    const clickedCard =
        header.parentElement;
    const cards =
        document.querySelectorAll(".creatorCard");
    cards.forEach(card => {
        if (card !== clickedCard) {
            card.classList.remove("open");
        }
    });
    clickedCard.classList.toggle("open");
}

/* ===========================================================
   ADD CREATOR MODAL
=========================================================== */

function openCreatorModal() {
    clearCreatorForm();
    document
        .getElementById("creatorModal")
        .classList
        .remove("hidden");

}

function closeCreatorModal() {
    document
        .getElementById("creatorModal")
        .classList
        .add("hidden");
}

function clearCreatorForm() {
    document.getElementById("creatorName").value = "";
    document.getElementById("creatorPhone").value = "";
    document.getElementById("creatorEmail").value = "";
    document.getElementById("creatorInstagram").value = "";
    document.getElementById("creatorFollowers").value = "";

}


/* ===========================================================
   ADD CREATOR
=========================================================== */

async function addCreator() {

    const name =
        document
        .getElementById("creatorName")
        .value
        .trim();

    const phone =
        document
        .getElementById("creatorPhone")
        .value
        .trim();

    const email =
        document
        .getElementById("creatorEmail")
        .value
        .trim();

    const instagram =
        document
        .getElementById("creatorInstagram")
        .value
        .replace("@","")
        .trim();

    const followers =
        document
        .getElementById("creatorFollowers")
        .value
        .trim();

    if (
        !name ||
        !phone ||
        !email ||
        !instagram ||
        !followers

    ){
        alert("Please complete all fields.");
        return;
    }

    try{
        const url =
        CONFIG.API_URL +
        "?action=addCreator" +
        "&name=" + encodeURIComponent(name) +
        "&phone=" + encodeURIComponent(phone) +
        "&email=" + encodeURIComponent(email) +
        "&instagram=" + encodeURIComponent(instagram) +
        "&followers=" + encodeURIComponent(followers) +
        "&college=" + encodeURIComponent(SESSION.college) +
        "&assignedLCA=" + encodeURIComponent(SESSION.assignedLCA) +
        "&assignedCA=" + encodeURIComponent(SESSION.name);
        const response =
            await fetch(url);
        const data =
            await response.json();
        if(!data.success){
            alert(data.message);
            return;
        }
        closeCreatorModal();
        loadDashboard();
    }

    catch(err){
        console.error(err);
        alert("Unable to add creator.");
    }
}


/* ===========================================================
   REEL SUBMISSION MODAL
=========================================================== */
function openReelModal(
    creatorID,
    reelNumber
){
    CURRENT_CREATOR = creatorID;
    CURRENT_REEL = reelNumber;
    document
        .getElementById("reelLink")
        .value = "";
    document
        .getElementById("reelTitle")
        .innerHTML =
        "Submit Reel " + reelNumber;
    document
        .getElementById("reelModal")
        .classList
        .remove("hidden");
}

function closeReelModal(){
    CURRENT_CREATOR = null;
    CURRENT_REEL = null;
    document
        .getElementById("reelModal")
        .classList
        .add("hidden");
}


/* ===========================================================
   SUBMIT REEL
=========================================================== */

async function submitReel(){
    const reelLink =
        document
        .getElementById("reelLink")
        .value
        .trim();

    if(reelLink==""){
        alert("Please enter the Reel URL.");
        return;
    }

    try{
        const url =
        CONFIG.API_URL +
        "?action=submitReel" +
        "&creatorID=" +
        encodeURIComponent(CURRENT_CREATOR) +
        "&reelNumber=" +
        encodeURIComponent(CURRENT_REEL) +
        "&reelLink=" +
        encodeURIComponent(reelLink) +
        "&submittedBy=" +
        encodeURIComponent(SESSION.name);
        const response =
            await fetch(url);
        const data =
            await response.json();
        if(!data.success){
            alert(data.message);
            return;
        }
        closeReelModal();
        loadDashboard();
    }
    catch(err){
        console.error(err);
        alert("Unable to submit reel.");
    }
}

/* ===========================================================
   UI HELPERS
=========================================================== */
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeCreatorModal();
        closeReelModal();
    }
});


window.addEventListener("click", function (e) {
    const creatorModal =
        document.getElementById("creatorModal");
    const reelModal =
        document.getElementById("reelModal");
    if (e.target === creatorModal) {
        closeCreatorModal();
    }
    if (e.target === reelModal) {
        closeReelModal();
    }
});


/* ===========================================================
   LOADING
=========================================================== */
function showLoading() {
    document.body.classList.add("loading");
}
function hideLoading() {
    document.body.classList.remove("loading");
}


/* ===========================================================
   REFRESH
=========================================================== */
async function refreshDashboard() {
    showLoading();
    await loadDashboard();
    hideLoading();
}


/* ===========================================================
   AUTO REFRESH
=========================================================== */

setInterval(function () {
    loadDashboard();
}, 60000);


/* ===========================================================
   PAGE VISIBILITY
=========================================================== */
document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
        loadDashboard();
    }
});


/* ===========================================================
   COUNTER ANIMATION
=========================================================== */

function animateCounter(element, endValue) {
    const duration = 500;
    const startValue = 0;
    const startTime = performance.now();
    function update(now) {
        const progress = Math.min(
            (now - startTime) / duration,
            1
        );
      
        const value = Math.floor(
            progress *
            (endValue - startValue)
            +
            startValue
        );
        element.innerHTML = value;
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}


/* ===========================================================
   OVERRIDE RENDER
=========================================================== */
const originalRenderDashboard = renderDashboard;
renderDashboard = function () {
    originalRenderDashboard();
    animateCounter(
        document.getElementById("totalCreators"),
        CREATORS.length
    );

    let r1 = 0;
    let r2 = 0;
    let r3 = 0;

    CREATORS.forEach(c => {
        if (c.reel1.exists) r1++;
        if (c.reel2.exists) r2++;
        if (c.reel3.exists) r3++;
    });
  
    animateCounter(
        document.getElementById("reel1Count"),
        r1
    );
    animateCounter(
        document.getElementById("reel2Count"),
        r2
    );
    animateCounter(
        document.getElementById("reel3Count"),
        r3
    );
};
