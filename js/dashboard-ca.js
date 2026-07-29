let SESSION = null;
let CREATORS = [];
let CURRENT_CREATOR = null;
let CURRENT_REEL = null;
let CURRENT_REEL_NUMBER = null;

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

function renderCreatorCards(creators){

    const container =
        document.getElementById("creatorContainer");

    container.innerHTML = "";

    creators.forEach(creator=>{

        let html = `

        <div class="creatorSection">

            <div class="creatorSectionHeader">

                <div class="creatorIdentity">

                    <span class="creatorEmoji">

                        👤

                    </span>

                    <span class="creatorSectionName">

                        ${creator.name}

                    </span>

                    <span class="creatorDivider">

                        |

                    </span>

                    <a
                        class="creatorSectionInstagram"
                        href="https://instagram.com/${creator.instagram}"
                        target="_blank">

                        @${creator.instagram}

                    </a>

                    <span class="creatorDivider">

                        |

                    </span>

                    <span class="creatorFollowers">

                        ${Number(creator.followers || 0).toLocaleString()} Followers

                    </span>

                </div>

            </div>

        `;

        html += buildCARow(
            creator,
            creator.reel1,
            1
        );

        html += buildCARow(
            creator,
            creator.reel2,
            2
        );

        html += buildCARow(
            creator,
            creator.reel3,
            3
        );

        html += `

        </div>

        `;

        container.innerHTML += html;

    });

}

function buildCARow(
creator,
reel,
reelNumber
){

    if(!reel.exists){

        return `

        <div class="creatorReelRow">

            <div class="creatorReelTitle">

                Reel ${reelNumber}

            </div>

            <div class="creatorReelStatus statusEmpty">

                Not Submitted

            </div>

            <div class="creatorReelActions">

                <button
                    class="reviewButton"
                    onclick="openReelModal(
                    '${creator.creatorID}',
                    ${reelNumber}
                    )">

                    Submit Reel

                </button>

            </div>

        </div>

        `;

    }

    if(reel.status=="APPROVED"){

        return `

        <div class="creatorReelRow">

            <div class="creatorReelTitle">

                Reel ${reelNumber}

            </div>

            <div class="creatorReelStatus statusApproved">

                Approved

            </div>

            <div class="creatorReelActions">

                <a
                href="${reel.link}"
                target="_blank"
                class="viewReelButton">

                    View Reel

                </a>

            </div>

        </div>

        `;

    }

    if(reel.status=="PENDING"){

        return `

        <div class="creatorReelRow">

            <div class="creatorReelTitle">

                Reel ${reelNumber}

            </div>

            <div class="creatorReelStatus statusPending">

                Pending Approval

            </div>

            <div class="creatorReelActions">

                <a
                href="${reel.link}"
                target="_blank"
                class="viewReelButton">

                    View Reel

                </a>

            </div>

        </div>

        `;

    }

    return `

    <div class="creatorReelRow">

        <div class="creatorReelTitle">

            Reel ${reelNumber}

        </div>

        <div class="creatorReelStatus statusRejected">

            Rejected

        </div>

        <div class="creatorReelActions">

            <button
                class="reviewButton"
                onclick="openReelModal(
                '${creator.creatorID}',
                ${reelNumber}
                )">

                Resubmit

            </button>

        </div>

    </div>

    `;

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
                    Reel ${reel.exists
? reel.reelNumber
: reelNumber}
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
                Reel ${reel.exists
? reel.reelNumber
: reelNumber}
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
                ${reel.exists
? reel.reelNumber
: reelNumber}
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

async function addCreator(){

    const button =
        document.getElementById("addCreatorButton");

    button.disabled = true;

    button.innerHTML = "Adding...";

    try{

        const response = await fetch(

            CONFIG.API_URL +

            "?action=addCreator" +

            "&name=" +

            encodeURIComponent(document.getElementById("creatorName").value.trim()) +

            "&phone=" +

            encodeURIComponent(document.getElementById("creatorPhone").value.trim()) +

            "&email=" +

            encodeURIComponent(document.getElementById("creatorEmail").value.trim()) +

            "&instagram=" +

            encodeURIComponent(document.getElementById("creatorInstagram").value.trim()) +

            "&followers=" +

            encodeURIComponent(document.getElementById("creatorFollowers").value.trim()) +

            "&college=" +

            encodeURIComponent(SESSION.college) +

            "&assignedLCA=" +

            encodeURIComponent(SESSION.assignedLCA) +

            "&assignedCA=" +

            encodeURIComponent(SESSION.name)

        );

        const data =
            await response.json();

        if(data.success){

            button.innerHTML = "Added ✓";

            await new Promise(resolve=>setTimeout(resolve,800));

            closeCreatorModal();

            await loadDashboard();

        }

        else{

            button.disabled = false;

            button.innerHTML = "Add Creator";

            alert(data.message);

        }

    }

    catch(err){

        console.error(err);

        button.disabled = false;

        button.innerHTML = "Add Creator";

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
    CURRENT_REEL_NUMBER = reelNumber;
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
    CURRENT_REEL_NUMBER = null;
    document
        .getElementById("reelModal")
        .classList
        .add("hidden");

}


/* ===========================================================
   SUBMIT REEL
=========================================================== */

async function submitReel(){

    const button =
        document.getElementById("submitReelButton");

    const input =
        document.getElementById("reelLink");

    if(input.value.trim()==""){

        alert("Please enter a Reel Link.");

        return;

    }

    button.disabled = true;

    button.innerHTML = "Submitting...";

    try{

        const response = await fetch(

            CONFIG.API_URL +

            "?action=submitReel" +

            "&creatorID=" +

            encodeURIComponent(CURRENT_CREATOR) +

            "&reelNumber=" +

            encodeURIComponent(CURRENT_REEL_NUMBER) +

            "&reelLink=" +

            encodeURIComponent(input.value.trim()) +

            "&submittedBy=" +

            encodeURIComponent(SESSION.name)

        );

        const data =
            await response.json();

        if(data.success){

            button.innerHTML =
                "Submitted ✓";

            await new Promise(resolve=>setTimeout(resolve,800));

            closeReelModal();

            await loadDashboard();

        }

        else{

            button.disabled = false;

            button.innerHTML =
                "Submit Reel";

            alert(data.message);

        }

    }

    catch(err){

        console.error(err);

        button.disabled = false;

        button.innerHTML =
            "Submit Reel";

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

/* ===========================================================
   REFERRAL CARD
=========================================================== */

async function loadReferralData() {

    try {

        const response = await fetch(

            CONFIG.API_URL +

            "?action=getReferralData" +

            "&username=" +

            encodeURIComponent(SESSION.username)

        );

        const data = await response.json();

        if(data.success){

            document.getElementById("referralCount").innerHTML =
                data.referralCount;

            SESSION.referralCode =
                data.referralCode;

            SESSION.referralCount =
                data.referralCount;

            localStorage.setItem(
                "SHEIN_SESSION",
                JSON.stringify(SESSION)
            );

        }

    }

    catch(err){

        console.error(err);

    }

}


/* ===========================================================
   ORDER MODAL
=========================================================== */

function openOrderModal(){

    document.getElementById("orderID").value = "";

    document.getElementById("orderScreenshot").value = "";

    document
        .getElementById("orderModal")
        .classList
        .remove("hidden");

}

function closeOrderModal(){

    document
        .getElementById("orderModal")
        .classList
        .add("hidden");

}


/* ===========================================================
   SUBMIT ORDER
=========================================================== */

async function submitOrder() {

    const orderID =
        document.getElementById("orderID").value.trim();

    const file =
        document.getElementById("orderScreenshot").files[0];

    if (!orderID || !file) {

        alert("Please complete all fields.");
        return;

    }

    const button =
        document.getElementById("submitOrderButton");

    button.disabled = true;
    button.innerHTML = "Uploading...";

    const form = new FormData();

    form.append("action","submitOrder");
    form.append("orderID",orderID);
    form.append("caName",SESSION.name);
    form.append("college",SESSION.college);
    form.append("referralCode",SESSION.referralCode);
    form.append("image",file);

    try{

        const response =
            await fetch(CONFIG.API_URL,{
                method:"POST",
                body:form
            });

        const data =
            await response.json();

        if(data.success){

            button.innerHTML = "Submitted ✓";

            setTimeout(()=>{

                closeOrderModal();

                button.disabled = false;
                button.innerHTML = "Submit Order";

            },800);

        }else{

            button.disabled = false;
            button.innerHTML = "Submit Order";

            alert(data.message);

        }

    }catch(err){

        console.error(err);

        button.disabled = false;
        button.innerHTML = "Submit Order";

        alert("Upload Failed.");

    }

}

/* ===========================================================
   MODAL ESCAPE
=========================================================== */
const originalKeyListener = document.onkeydown;
document.addEventListener("keydown",function(e){
    if(e.key==="Escape"){
        closeOrderModal();
    }
});

window.addEventListener("click",function(e){
    const modal =
        document.getElementById("orderModal");
    if(e.target===modal){
        closeOrderModal();
    }
});


/* ===========================================================
   LOAD REFERRALS ON DASHBOARD
=========================================================== */

const originalLoadDashboard = loadDashboard;
loadDashboard = async function(){
    await originalLoadDashboard();
    await loadReferralData();
};
