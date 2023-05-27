/*
{
    sites:[
        "origin url": {
            "chars": 11349,
            "wpm": 60
        },
        "origin url": {
            "chars": 11349,
            "wpm": 60
        }
    ],
    keys:[
        "a": 0,
        "b": 1,
        ...
    ]
}
*/

const weblist = document.getElementById("web-list");
const entries = document.getElementsByClassName("entry-btn");



const viewer = document.getElementById("viewer");

const back = document.getElementById("back");
const title = document.getElementById("title");

const leftmain = document.getElementById("left-main");
const centermain = document.getElementById("center-main");
const rightmain = document.getElementById("right-main");

function getSiteList() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["sitelist"], (result) => {
            console.log("SiteList queried");

            const sitelist = JSON.parse(result.sitelist || '{"sites": []}');

            console.log("Before");
            console.log(sitelist);

            resolve(sitelist);
        });
    });
}

function getTypeData(site) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(site, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                console.log(`TabData for "${site}" queried`);

                tabdata = JSON.parse(result[site] || "{}");
                tabdata.site = site;

                console.log("Before");
                console.log(tabdata);

                resolve();
            }
        });
    });
}

var tabdata = {};

async function goTo(site) {
    console.log("Go To " + site);

    title.innerHTML = site;

    await getTypeData(site)
        .catch((error) => {
            console.error(error);
        });

    leftmain.innerHTML = tabdata.chars || 0;
    rightmain.innerHTML = (Math.round(((60000 / tabdata.avgtime) + Number.EPSILON) * 100) / 100) || 0;
    centermain.innerHTML = assignGrade(rightmain.innerHTML);

    viewer.style.transform = "translateX(0px)";
}

function assignGrade(wpm) {
    if (wpm >= 100) {
        return 'SSS+';
    } else if (wpm >= 95) {
        return 'SSS';
    } else if (wpm >= 90) {
        return 'SSS-';
    } else if (wpm >= 85) {
        return 'SS+';
    } else if (wpm >= 80) {
        return 'SS';
    } else if (wpm >= 75) {
        return 'SS-';
    } else if (wpm >= 70) {
        return 'S+';
    } else if (wpm >= 65) {
        return 'S';
    } else if (wpm >= 60) {
        return 'S-';
    } else if (wpm >= 55) {
        return 'A+';
    } else if (wpm >= 50) {
        return 'A';
    } else if (wpm >= 45) {
        return 'A-';
    } else if (wpm >= 40) {
        return 'B+';
    } else if (wpm >= 35) {
        return 'B';
    } else if (wpm >= 30) {
        return 'B-';
    } else if (wpm >= 25) {
        return 'C+';
    } else if (wpm >= 20) {
        return 'C';
    } else if (wpm >= 15) {
        return 'C-';
    } else if (wpm >= 10) {
        return 'D+';
    } else {
        return 'D';
    }
}

back.addEventListener("click", function () {
    viewer.style.transform = "translateX(300px)";
});

const sitelist = await getSiteList();

for (let i in sitelist.sites) {
    console.log(sitelist.sites[i].url);

    weblist.innerHTML += `
    <div class="entry">
        <h4>${sitelist.sites[i].url}</h4>
        <button class="entry-btn" data-url="${sitelist.sites[i].url}">&rarr;</button>
    </div>
    `;
}

for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    entry.addEventListener("click", function () {
        goTo(entry.dataset.url);
    });
}
