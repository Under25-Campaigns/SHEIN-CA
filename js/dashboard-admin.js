const SESSION = JSON.parse(
    localStorage.getItem("SHEIN_SESSION") || "{}"
);

if (!SESSION.role || SESSION.role !== "ADMIN") {

    window.location.href = "index.html";

}

let COLLEGES = [];

async function loadDashboard(){

    try{

        showLoading();

        const response = await fetch(

            CONFIG.API_URL +

            "?action=getAdminOverview"

        );

        const data = await response.json();

        if(!data.success){

            showError(data.message);

            return;

        }

        COLLEGES = data.colleges;

        updateStats(data);

        sortColleges();

        sortCALists();

        renderCollegeCards();

    }

    catch(err){

        console.error(err);

        showError("Unable to connect to Apps Script.");

    }

}



function renderCollegeCards(){

    const container =
        document.getElementById("collegeContainer");

    container.innerHTML = "";

    const template =
        document.getElementById("collegeTemplate");

    COLLEGES.forEach(college=>{

        const node =
            template.content.cloneNode(true);

        node.querySelector(".collegeName").innerHTML =
            college.college;

        node.querySelector(".collegeStats").innerHTML =

            `${college.totalCAs} CAs • ${college.totalReels} Reels • ${college.referralCount} Referrals`;

        const lcaSection =
            node.querySelector(".lcaSection");

        lcaSection.innerHTML =

            `
            <div class="adminLCA">

                <strong>

                    ${Object.keys(college.lcas).length
                        ? Object.values(college.lcas)[0].name
                        : "-"}

                </strong>

                •

                ${Object.keys(college.lcas).length
                        ? Object.values(college.lcas)[0].referrals
                        : 0}

                Referrals

            </div>
            `;

        const caSection =
            node.querySelector(".caSection");

        let html = "";

        Object.values(college.lcas).forEach(lca=>{

            lca.cas.forEach(ca=>{

                html +=

                `
                <div class="adminCA">

                    <div>

                        <strong>${ca.name}</strong>

                        •

                        ${ca.creators} Creators

                        •

                        ${ca.reels} Reels

                        •

                        ${ca.referrals} Referrals

                    </div>

                    <button
                        class="removeButton"
                        onclick="removeCA('${ca.name}')">

                        Remove

                    </button>

                </div>
                `;

            });

        });

        caSection.innerHTML = html;

        container.appendChild(node);

    });

}

function toggleCollege(header){

    const body =
        header.nextElementSibling;

    const arrow =
        header.querySelector(".expandArrow");

    if(body.style.display=="block"){

        body.style.display="none";

        arrow.innerHTML="▼";

        return;

    }

    document
        .querySelectorAll(".collegeBody")
        .forEach(x=>x.style.display="none");

    document
        .querySelectorAll(".expandArrow")
        .forEach(x=>x.innerHTML="▼");

    body.style.display="block";

    arrow.innerHTML="▲";

}



async function removeCA(caName){

    if(!confirm("Remove this Campus Ambassador?"))
        return;

    try{

        const response = await fetch(

            CONFIG.API_URL +

            "?action=deactivateCA" +

            "&caName=" +

            encodeURIComponent(caName)

        );

        const data = await response.json();

        if(data.success){

            loadDashboard();

        }

        else{

            alert(data.message);

        }

    }

    catch(err){

        console.error(err);

        alert("Unable to connect.");

    }

}
// ======================================================
// SEARCH
// ======================================================

const searchBox =
    document.getElementById("searchCollege");

if(searchBox){

    searchBox.addEventListener("input",function(){

        const keyword =
            this.value.trim().toLowerCase();

        if(keyword===""){

            renderCollegeCards();

            return;

        }

        const filtered =
            COLLEGES.filter(college=>{

                if(
                    college.college
                        .toLowerCase()
                        .includes(keyword)
                ){
                    return true;
                }

                let found = false;

                Object.values(college.lcas)
                    .forEach(lca=>{

                        if(
                            lca.name
                               .toLowerCase()
                               .includes(keyword)
                        ){

                            found = true;

                        }

                        lca.cas.forEach(ca=>{

                            if(
                                ca.name
                                  .toLowerCase()
                                  .includes(keyword)
                            ){

                                found = true;

                            }

                        });

                    });

                return found;

            });

        renderFilteredCards(filtered);

    });

}



// ======================================================
// FILTERED RENDER
// ======================================================

function renderFilteredCards(list){

    const backup = COLLEGES;

    COLLEGES = list;

    renderCollegeCards();

    COLLEGES = backup;

}



// ======================================================
// REFRESH BUTTON
// ======================================================

async function refreshDashboard(){

    const button =
        document.getElementById("refreshButton");

    if(button){

        button.disabled = true;

        button.innerHTML = "Refreshing...";

    }

    await loadDashboard();

    if(button){

        button.disabled = false;

        button.innerHTML = "Refresh";

    }

}



// ======================================================
// CARD COUNTER ANIMATION
// ======================================================

function animateNumber(id,value){

    const element =
        document.getElementById(id);

    if(!element) return;

    let current = 0;

    const increment =
        Math.max(
            1,
            Math.ceil(value/40)
        );

    const timer =
        setInterval(()=>{

            current += increment;

            if(current>=value){

                current=value;

                clearInterval(timer);

            }

            element.innerHTML =
                current.toLocaleString();

        },15);

}



// ======================================================
// UPDATE STATS
// ======================================================

function updateStats(data){

    animateNumber(
        "collegeCount",
        data.totalColleges
    );

    animateNumber(
        "lcaCount",
        data.totalLCAs
    );

    animateNumber(
        "caCount",
        data.totalCAs
    );

    animateNumber(
        "creatorCount",
        data.totalCreators
    );

    animateNumber(
        "reelCount",
        data.totalReels
    );

    animateNumber(
        "referralCount",
        data.totalReferrals
    );

}
// ======================================================
// EXPAND / COLLAPSE ANIMATION
// ======================================================

function closeAllCards(){

    document
        .querySelectorAll(".collegeBody")
        .forEach(body=>{

            body.style.maxHeight = "0px";
            body.style.opacity = "0";

        });

    document
        .querySelectorAll(".expandArrow")
        .forEach(arrow=>{

            arrow.innerHTML="▼";

        });

}



function toggleCollege(header){

    const body =
        header.nextElementSibling;

    const arrow =
        header.querySelector(".expandArrow");

    const open =
        body.style.maxHeight &&
        body.style.maxHeight!="0px";

    closeAllCards();

    if(open){

        return;

    }

    body.style.maxHeight =
        body.scrollHeight + "px";

    body.style.opacity="1";

    arrow.innerHTML="▲";

}



// ======================================================
// REMOVE CA
// ======================================================

async function removeCA(name){

    if(
        !confirm(
            "Remove this Campus Ambassador?"
        )
    ){
        return;
    }

    try{

        const response =
            await fetch(

                CONFIG.API_URL +

                "?action=deactivateCA" +

                "&caName=" +

                encodeURIComponent(name)

            );

        const data =
            await response.json();

        if(data.success){

            await reloadDashboard();

        }

        else{

            alert(data.message);

        }

    }

    catch(err){

        console.error(err);

        alert("Unable to connect.");

    }

}



// ======================================================
// REMOVE CREATOR
// ======================================================

async function removeCreator(id){

    if(
        !confirm(
            "Remove this Creator?"
        )
    ){
        return;
    }

    try{

        const response =
            await fetch(

                CONFIG.API_URL +

                "?action=deactivateCreator" +

                "&creatorID=" +

                encodeURIComponent(id)

            );

        const data =
            await response.json();

        if(data.success){

            await reloadDashboard();

        }

        else{

            alert(data.message);

        }

    }

    catch(err){

        console.error(err);

        alert("Unable to connect.");

    }

}



// ======================================================
// BUILD CREATOR HTML
// ======================================================

function buildCreatorHTML(creators){

    let html="";

    creators.forEach(creator=>{

        html+=`

        <div class="creatorCard">

            <div class="creatorLeft">

                <div class="creatorName">

                    ${creator.name}

                </div>

                <div class="creatorInstagram">

                    @${creator.instagram}

                </div>

                <div class="creatorFollowers">

                    ${(Number(creator.followers)||0).toLocaleString()} Followers

                </div>

            </div>

            <div class="creatorRight">

                <button

                    class="removeButton"

                    onclick="removeCreator('${creator.creatorID}')">

                    Remove Creator

                </button>

            </div>

        </div>

        `;

    });

    return html;

}

// ======================================================
// BUILD CA HTML
// ======================================================

function buildCAHTML(lca){

    let html = "";

    lca.cas.forEach(ca=>{

        html += `

        <div class="adminCACard">

            <div
                class="adminCAHeader"
                onclick="toggleCA(this)">

                <div class="adminCAInfo">

                    <div class="adminCAName">

                        ${ca.name}

                    </div>

                    <div class="adminCAStats">

                        ${ca.creators} Creators

                        •

                        ${ca.reels} Reels

                        •

                        ${ca.referrals} Referrals

                    </div>

                </div>

                <div class="adminCAButtons">

                    <button

                        class="removeButton"

                        onclick="event.stopPropagation();removeCA('${ca.name}')">

                        Remove CA

                    </button>

                    <span class="expandArrow">

                        ▼

                    </span>

                </div>

            </div>

            <div class="adminCABody">

                ${buildCreatorHTML(ca.creatorsList || [])}

            </div>

        </div>

        `;

    });

    return html;

}



// ======================================================
// BUILD LCA HTML
// ======================================================

function buildLCAHTML(college){

    let html = "";

    Object.values(college.lcas).forEach(lca=>{

        html += `

        <div class="adminLCASection">

            <div class="adminLCAHeader">

                <div>

                    <strong>

                        ${lca.name}

                    </strong>

                    •

                    ${lca.referrals}

                    Referrals

                </div>

            </div>

            ${buildCAHTML(lca)}

        </div>

        `;

    });

    return html;

}



// ======================================================
// RE-RENDER COLLEGE CARDS
// ======================================================

function renderCollegeCards(){

    const container =
        document.getElementById("collegeContainer");

    container.innerHTML = "";

    const template =
        document.getElementById("collegeTemplate");

    COLLEGES.forEach(college=>{

        const node =
            template.content.cloneNode(true);

        node.querySelector(".collegeName").innerHTML =
            college.college;

        node.querySelector(".collegeStats").innerHTML =

            `${college.totalCAs} CAs • ${college.totalReels} Reels • ${college.referralCount} Referrals`;

        node.querySelector(".collegeBody").innerHTML =
            buildLCAHTML(college);

        container.appendChild(node);

    });

}



// ======================================================
// TOGGLE CA
// ======================================================

function toggleCA(header){

    const body =
        header.nextElementSibling;

    const arrow =
        header.querySelector(".expandArrow");

    const open =
        body.style.maxHeight &&
        body.style.maxHeight!="0px";

    document
        .querySelectorAll(".adminCABody")
        .forEach(x=>{

            x.style.maxHeight="0px";

        });

    document
        .querySelectorAll(".adminCAHeader .expandArrow")
        .forEach(x=>{

            x.innerHTML="▼";

        });

    if(open){

        return;

    }

    body.style.maxHeight =
        body.scrollHeight + "px";

    arrow.innerHTML="▲";

}

// ======================================================
// EMPTY STATE
// ======================================================

function showEmptyState(){

    const container =
        document.getElementById("collegeContainer");

    container.innerHTML = `

        <div class="emptyState">

            <div class="emptyIcon">

                📊

            </div>

            <h2>

                No Colleges Found

            </h2>

            <p>

                There are no matching colleges for your search.

            </p>

        </div>

    `;

}



// ======================================================
// SEARCH RENDER
// ======================================================

function renderFilteredCards(filtered){

    if(filtered.length===0){

        showEmptyState();

        return;

    }

    const backup = COLLEGES;

    COLLEGES = filtered;

    renderCollegeCards();

    COLLEGES = backup;

}



// ======================================================
// SORT COLLEGES
// ======================================================

function sortColleges(){

    COLLEGES.sort(function(a,b){

        return a.college.localeCompare(b.college);

    });

}



// ======================================================
// SORT CAs
// ======================================================

function sortCALists(){

    COLLEGES.forEach(college=>{

        Object.values(college.lcas).forEach(lca=>{

            lca.cas.sort(function(a,b){

                return a.name.localeCompare(b.name);

            });

        });

    });

}



// ======================================================
// INITIALIZE
// ======================================================

async function initializeDashboard(){

    await loadDashboard();

    sortColleges();

    sortCALists();

    renderCollegeCards();

}



// ======================================================
// LOGOUT
// ======================================================

function logout(){

    localStorage.removeItem("SHEIN_SESSION");

    window.location.href = "index.html";

}



// ======================================================
// PAGE LOAD
// ======================================================

window.addEventListener("load",function(){

    initializeDashboard();

});



async function removeCreator(creatorID){

    if(!confirm("Remove this Creator?"))
        return;

    try{

        const response = await fetch(

            CONFIG.API_URL +

            "?action=deactivateCreator" +

            "&creatorID=" +

            encodeURIComponent(creatorID)

        );

        const data = await response.json();

        if(data.success){

            loadDashboard();

        }

        else{

            alert(data.message);

        }

    }

    catch(err){

        console.error(err);

        alert("Unable to connect.");

    }

}



function logout(){

    localStorage.removeItem("SHEIN_SESSION");

    window.location.href="index.html";

}



window.onload=function(){

    loadDashboard();

};

// ======================================================
// LOADING
// ======================================================

function showLoading(){

    const container =
        document.getElementById("collegeContainer");

    if(!container) return;

    container.innerHTML = `

        <div class="loadingState">

            <div class="loadingSpinner"></div>

            <div class="loadingText">

                Loading Dashboard...

            </div>

        </div>

    `;

}



// ======================================================
// ERROR STATE
// ======================================================

function showError(message){

    const container =
        document.getElementById("collegeContainer");

    if(!container) return;

    container.innerHTML = `

        <div class="emptyState">

            <div class="emptyIcon">

                ⚠️

            </div>

            <h2>

                Unable to load dashboard

            </h2>

            <p>

                ${message}

            </p>

        </div>

    `;

}

// ======================================================
// PRESERVE OPEN COLLEGE
// ======================================================

let OPEN_COLLEGE = "";

let OPEN_CA = "";



function rememberOpenCards(){

    OPEN_COLLEGE = "";

    OPEN_CA = "";

    document.querySelectorAll(".collegeCard").forEach(card=>{

        const body =
            card.querySelector(".collegeBody");

        if(body && body.style.maxHeight!="0px"){

            OPEN_COLLEGE =
                card.querySelector(".collegeName").innerText;

        }

    });

    document.querySelectorAll(".adminCACard").forEach(card=>{

        const body =
            card.querySelector(".adminCABody");

        if(body && body.style.maxHeight!="0px"){

            OPEN_CA =
                card.querySelector(".adminCAName").innerText;

        }

    });

}



function restoreOpenCards(){

    if(OPEN_COLLEGE!=""){

        document.querySelectorAll(".collegeCard").forEach(card=>{

            if(

                card.querySelector(".collegeName").innerText===OPEN_COLLEGE

            ){

                card.querySelector(".collegeHeader").click();

            }

        });

    }

    if(OPEN_CA!=""){

        document.querySelectorAll(".adminCACard").forEach(card=>{

            if(

                card.querySelector(".adminCAName").innerText===OPEN_CA

            ){

                card.querySelector(".adminCAHeader").click();

            }

        });

    }

}

// ======================================================
// RELOAD
// ======================================================

async function reloadDashboard(){

    rememberOpenCards();

    await loadDashboard();

    restoreOpenCards();

}
