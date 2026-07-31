let SESSION = null;
let CAMPUS_AMBASSADORS = [];
let CURRENT_REEL_ID = null;


window.addEventListener("load", () => {
    validateSession();
});


function validateSession() {
    const raw = localStorage.getItem("SHEIN_SESSION");
    if (!raw) {
        location.href = "index.html";
        return;
    }
    SESSION = JSON.parse(raw);

    if (SESSION.role !== "LCA") {
        location.href = "index.html";
        return;
    }
    document.getElementById("welcomeText").innerHTML =
        "Welcome, " + SESSION.name;
    startSessionTimer();
    loadDashboard();
}


function logout() {
    localStorage.removeItem("SHEIN_SESSION");
    location.href = "index.html";
}

/* ===========================================================
   AUTO LOGOUT (15 MINUTES INACTIVE)
=========================================================== */
const SESSION_TIMEOUT = 15 * 60 * 1000;
let inactivityTimer;
function startSessionTimer() {
    resetSessionTimer();
    [
        "mousemove",
        "mousedown",
        "click",
        "scroll",
        "keypress",
        "touchstart"
    ].forEach(event => {
        document.addEventListener(
            event,
            resetSessionTimer
        );
    });
}

function resetSessionTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        alert("Your session has expired.");
        logout();
    }, SESSION_TIMEOUT);
}

async function loadDashboard() {

    try {

        const response = await fetch(

            CONFIG.API_URL +
            "?action=getLCAOverview" +
            "&lcaName=" +
            encodeURIComponent(SESSION.name)

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);
            return;

        }

        CAMPUS_AMBASSADORS =
            data.campusAmbassadors;

        document.getElementById("referralCount").innerText =
            data.referralCount || 0;

        renderDashboard();

    }

    catch (err) {

        console.error(err);
        alert("Unable to connect.");

    }

}


function renderDashboard() {

    document.getElementById("totalCA").innerHTML =
        CAMPUS_AMBASSADORS.length;

    let approved = 0;
    let pending = 0;
    let rejected = 0;
    CAMPUS_AMBASSADORS.forEach(ca => {
        ca.creators.forEach(creator => {
            creator.reels.forEach(reel => {
                if (reel.status === "APPROVED")
                    approved++;
                if (reel.status === "PENDING")
                    pending++;
                if (reel.status === "REJECTED")
                    rejected++;
            });
        });
    });

    document.getElementById("approvedReels").innerHTML =
        approved;
    document.getElementById("pendingReels").innerHTML =
        pending;
    document.getElementById("rejectedReels").innerHTML =
        rejected;
    renderCACards(CAMPUS_AMBASSADORS);
}

document
.getElementById("searchCA")
.addEventListener(
    "input",
    function(){
        const q =
            this.value
            .trim()
            .toLowerCase();
        const filtered =
        CAMPUS_AMBASSADORS.filter(ca =>
            ca.caName
            .toLowerCase()
            .includes(q)
        );
        renderCACards(filtered);
    }
);

function renderCACards(list){

    const container =
        document.getElementById("caContainer");

    container.innerHTML = "";

    const template =
        document.getElementById("caTemplate");

    list.forEach(ca=>{

        const node =
            template.content.cloneNode(true);

        node.querySelector(".caName").innerHTML =
            ca.caName;

        node.querySelector(".caStats").innerHTML =
            `
            ${ca.creators.length} Creators
            &nbsp;&nbsp;•&nbsp;&nbsp;
            ${ca.totalApprovedReels} Reels
            &nbsp;&nbsp;•&nbsp;&nbsp;
            ${Number(ca.totalReferrals || 0).toLocaleString()} Referrals
            `;

        const creatorList =
            node.querySelector(".creatorList");

        creatorList.innerHTML =
            buildCreatorHTML(ca.creators);

        container.appendChild(node);

    });

}

function buildCreatorHTML(creators){

    let html = "";

    creators.forEach(creator=>{

        html += `

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

        for(let i=1;i<=3;i++){

            const reel = creator.reels.find(

                r => Number(r.reelNumber) === i

            );

            if(!reel){

                html += `

                <div class="creatorReelRow">

                    <div class="creatorReelTitle">

                        Reel ${i}

                    </div>

                    <div class="creatorReelStatus statusEmpty">

                        Not Submitted

                    </div>

                    <div class="creatorReelActions">

                        —

                    </div>

                </div>

                `;

                continue;

            }

            if(reel.status==="PENDING"){

                html += `

                <div class="creatorReelRow">

                    <div class="creatorReelTitle">

                        Reel ${i}

                    </div>

                    <div class="creatorReelStatus statusPending">

                        Pending Approval

                    </div>

                    <div class="creatorReelActions">

                        <a
                            href="${reel.reelLink || reel.link}"
                            target="_blank"
                            class="viewReelButton">

                            View Reel

                        </a>

                        <button
                            class="reviewButton"
                            onclick="openApprovalModal('${reel.reelID}')">

                            Review

                        </button>

                    </div>

                </div>

                `;

            }

            else if(reel.status==="APPROVED"){

                html += `

                <div class="creatorReelRow">

                    <div class="creatorReelTitle">

                        Reel ${i}

                    </div>

                    <div class="creatorReelStatus statusApproved">

                        Approved

                    </div>

                    <div class="creatorReelActions">

                        <a
                            href="${reel.reelLink || reel.link}"
                            target="_blank"
                            class="viewReelButton">

                            View Reel

                        </a>

                    </div>

                </div>

                `;

            }

            else{

                html += `

                <div class="creatorReelRow">

                    <div class="creatorReelTitle">

                        Reel ${i}

                    </div>

                    <div class="creatorReelStatus statusRejected">

                        Rejected

                    </div>

                    <div class="creatorReelActions">

                        <a
                            href="${reel.reelLink || reel.link}"
                            target="_blank"
                            class="viewReelButton">

                            View Reel

                        </a>

                    </div>

                </div>

                `;

            }

        }

        html += `

        </div>

        `;

    });

    return html;

}

function toggleCA(header){
    const clicked =
        header.parentElement;
    document
    .querySelectorAll(".creatorCard")
    .forEach(card=>{
        if(card!==clicked){
            card.classList.remove("open");
        }
    });
    clicked.classList.toggle("open");
}

function openApprovalModal(reelID){
    CURRENT_REEL_ID =
        reelID;
    document
    .getElementById("approvalMessage")
    .innerHTML =
    "Approve or reject this reel?";
    document
    .getElementById("approvalModal")
    .classList
    .remove("hidden");
}

function closeApprovalModal(){
    CURRENT_REEL_ID = null;
    document
    .getElementById("approvalModal")
    .classList
    .add("hidden");
}


/* ===========================================================
   APPROVE
=========================================================== */

async function approveCurrentReel(){
    const buttons =
        document.querySelectorAll("#approvalModal button");
    buttons.forEach(btn=>btn.disabled=true);
    const approveButton =
        buttons[1];
    approveButton.innerHTML =
        "Approving...";

    try{
        const response = await fetch(
            CONFIG.API_URL +
            "?action=approveReel" +
            "&reelID=" +
            encodeURIComponent(CURRENT_REEL_ID) +
            "&approvedBy=" +
            encodeURIComponent(SESSION.name)
        );

        const data =
            await response.json();

        if(data.success){
            approveButton.innerHTML =
                "Approved ✓";
            await new Promise(resolve=>setTimeout(resolve,700));
            closeApprovalModal();
            await loadDashboard();
        }

        else{
            buttons.forEach(btn=>btn.disabled=false);
            approveButton.innerHTML =
                "Approve";
            alert(data.message);
        }
    }
    catch(err){
        console.error(err);
        buttons.forEach(btn=>btn.disabled=false);
        approveButton.innerHTML =
            "Approve";
        alert("Unable to approve reel.");
    }
}


/* ===========================================================
   REJECT
=========================================================== */

async function rejectCurrentReel(){

    const buttons =
        document.querySelectorAll("#approvalModal button");

    buttons.forEach(btn=>btn.disabled=true);

    const rejectButton =
        buttons[2];

    rejectButton.innerHTML =
        "Rejecting...";

    try{

        const response = await fetch(

            CONFIG.API_URL +

            "?action=rejectReel" +

            "&reelID=" +
            encodeURIComponent(CURRENT_REEL_ID) +
            "&approvedBy=" +
            encodeURIComponent(SESSION.name)
        );

        const data =
            await response.json();
        if(data.success){
            rejectButton.innerHTML =
                "Rejected ✓";

            await new Promise(resolve=>setTimeout(resolve,700));
            closeApprovalModal();
            await loadDashboard();
        }

        else{
            buttons.forEach(btn=>btn.disabled=false);
            rejectButton.innerHTML =
                "Reject";
            alert(data.message);
        }
    }

    catch(err){
        console.error(err);
        buttons.forEach(btn=>btn.disabled=false);
        rejectButton.innerHTML =
            "Reject";
        alert("Unable to reject reel.");
    }
}


/* ===========================================================
   AUTO REFRESH
=========================================================== */
setInterval(function(){
    loadDashboard();
},60000);
