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
    loadDashboard();
}


function logout() {
    localStorage.removeItem("SHEIN_SESSION");
    location.href = "index.html";
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
            ca.totalApprovedReels +
            " Approved Reels";
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

                <div>

                    <div class="creatorSectionName">

                        👤 ${creator.name}

                    </div>

                    <div class="creatorSectionInstagram">

                        @${creator.instagram}

                    </div>

                </div>

            </div>

        `;

        for(let i=1;i<=3;i++){

            const reel = creator.reels.find(

                r=>Number(r.reelNumber)===i

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
                            class="viewReelButton"
                            href="${reel.reelLink || reel.link}"
                            target="_blank">

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
                            class="viewReelButton"
                            href="${reel.reelLink || reel.link}"
                            target="_blank">

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
                            class="viewReelButton"
                            href="${reel.reelLink || reel.link}"
                            target="_blank">

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
    const response =
    await fetch(
        CONFIG.API_URL +
        "?action=approveReel"
        +
        "&reelID="
        +
        encodeURIComponent(CURRENT_REEL_ID)
        +
        "&approvedBy="
        +
        encodeURIComponent(SESSION.name)
    );
    const data =
        await response.json();
    if(data.success){
        closeApprovalModal();
        loadDashboard();
    }
}


/* ===========================================================
   REJECT
=========================================================== */

async function rejectCurrentReel(){
    const response =
    await fetch(
        CONFIG.API_URL +
        "?action=rejectReel"
        +
        "&reelID="
        +
        encodeURIComponent(CURRENT_REEL_ID)
        +
        "&approvedBy="
        +
        encodeURIComponent(SESSION.name)
    );
    const data =
        await response.json();
    if(data.success){
        closeApprovalModal();
        loadDashboard();
    }
}


/* ===========================================================
   AUTO REFRESH
=========================================================== */
setInterval(function(){
    loadDashboard();
},60000);
