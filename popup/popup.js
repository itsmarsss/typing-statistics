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


const summary = document.getElementById("summary");
const autotypers = document.getElementById("autotypers");



const weblist = document.getElementById("web-list");
const entries = document.getElementsByClassName("entry-btn");



const viewer = document.getElementById("viewer");

const back = document.getElementById("back");
const title = document.getElementById("title");

const leftmain = document.getElementById("left-main");
const centermain = document.getElementById("center-main");
const rightmain = document.getElementById("right-main");



const key = document.getElementById("key");
const count = document.getElementById("count");



const moreinfo = document.getElementById("more-info");
const morestats = document.getElementById("more-stats");
const moreback = document.getElementById("more-back");
const jsonlist = document.getElementById("json-list");


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
                tabdata["site"] = site;

                console.log("Before");
                console.log(tabdata);

                resolve();
            }
        });
    });
}

function getSpecialTypeData(site) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(site, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                console.log(`TabData for "${site}" queried as special`);

                var temptabdata = JSON.parse(result[site] || "{}");
                temptabdata["site"] = site;

                resolve(temptabdata);
            }
        });
    });
}

var tabdata = {};

async function goTo(site) {
    console.log("Go To " + site);


    await getTypeData(site)
        .catch((error) => {
            console.error(error);
        });

    title.innerHTML = tabdata.fullurl;

    leftmain.innerHTML = tabdata.chars || 0;
    rightmain.innerHTML = (Math.round(((60000 / (tabdata.avgtime)) + Number.EPSILON) * 100) / 100) || 0;
    centermain.innerHTML = assignGrade(rightmain.innerHTML);

    viewer.style.transform = "translateX(0px)";
}

function assignGrade(wpm) {
    if (wpm >= 125) {
        return 'SSS+';
    } else if (wpm >= 120) {
        return 'SSS';
    } else if (wpm >= 115) {
        return 'SSS-';
    } else if (wpm >= 110) {
        return 'SS+';
    } else if (wpm >= 105) {
        return 'SS';
    } else if (wpm >= 100) {
        return 'SS-';
    } else if (wpm >= 95) {
        return 'S+';
    } else if (wpm >= 90) {
        return 'S';
    } else if (wpm >= 85) {
        return 'S-';
    } else if (wpm >= 80) {
        return 'A+';
    } else if (wpm >= 75) {
        return 'A';
    } else if (wpm >= 70) {
        return 'A-';
    } else if (wpm >= 65) {
        return 'B+';
    } else if (wpm >= 60) {
        return 'B';
    } else if (wpm >= 55) {
        return 'B-';
    } else if (wpm >= 50) {
        return 'C+';
    } else if (wpm >= 45) {
        return 'C';
    } else if (wpm >= 40) {
        return 'C-';
    } else if (wpm >= 35) {
        return 'D+';
    } else if (wpm >= 30) {
        return 'D';
    } else if (wpm >= 25) {
        return 'D-';
    } else {
        return 'F';
    }
}

function getFreq(key) {
    return tabdata[key];
}

summary.addEventListener("click", async function () {
    console.log("View all");

    tabdata = {};

    title.innerHTML = "Summary";

    const sitelist = await getSiteList();

    var cumulativeWPM = 0;

    for (let i in sitelist.sites) {
        console.log(sitelist.sites[i].url);

        const temptabdata = await getSpecialTypeData(sitelist.sites[i].url)
            .catch((error) => {
                console.error(error);
            });

        for (var jsonkey of Object.keys(temptabdata)) {
            if ((jsonkey != "site") && (jsonkey != "fullurl")) {
                if (!(jsonkey in tabdata)) {
                    tabdata[jsonkey] = 0;
                }
                tabdata[jsonkey] += Number(temptabdata[jsonkey]);
            } else {
                tabdata[jsonkey] = "N/A";
            }
        }

        cumulativeWPM += (Math.round(((60000 / (temptabdata.avgtime)) + Number.EPSILON) * 100) / 100) || 0
    }

    if (!("avgtime" in tabdata)) {
        tabdata["avgtime"] = 0;
    }
    tabdata["avgtime"] = tabdata["avgtime"] / sitelist.sites.length;
    tabdata["avgtime"] = (Math.round(((tabdata["avgtime"]) + Number.EPSILON) * 100) / 100) || 0;

    leftmain.innerHTML = tabdata.chars;
    rightmain.innerHTML = cumulativeWPM / sitelist.sites.length;
    rightmain.innerHTML = (Math.round(((Number(rightmain.innerHTML)) + Number.EPSILON) * 100) / 100) || 0;

    centermain.innerHTML = assignGrade(rightmain.innerHTML);

    viewer.style.transform = "translateX(0px)";
});

const title_cont = document.getElementsByClassName("title-cont")[0];
title_cont.addEventListener('mouseenter', () => {
    let textWidth = title.clientWidth;
    let boxWidth = parseFloat(getComputedStyle(title_cont).width);
    let translateVal = Math.min(boxWidth - textWidth, 0);
    title.style.transitionDuration = "3s";
    title.style.transform = "translateX(" + (translateVal - 10) + "px)";
});
title_cont.addEventListener('mouseleave', () => {
    title.style.transitionDuration = "0.3s";
    title.style.transform = "translateX(0)";
});

document.querySelectorAll(".key").forEach(function (keyb) {
    keyb.addEventListener('mouseover', function () {
        key.style.transform = "translateY(-5px)";
        setTimeout(function () {
            key.innerHTML = keyb.innerHTML;
            key.style.transform = "translateY(0px)";
        }, 100);

        count.style.transform = "translateY(-5px)";
        setTimeout(function () {
            if (keyb.innerHTML === "Space") {
                count.innerHTML = getFreq(" ") || 0;
            } else {
                count.innerHTML = getFreq(keyb.innerHTML.toLowerCase()) || 0;
            }
            count.style.transform = "translateY(0px)";
        }, 100);
    });
});

back.addEventListener("click", function () {
    viewer.style.transform = "translateX(300px)";
    moreinfo.style.transform = "translateY(500px)";
});

morestats.addEventListener("click", function () {
    moreinfo.style.transform = "translateY(0px)";

    jsonlist.innerHTML = "";

    for (var jsonkey of Object.keys(tabdata)) {
        jsonlist.innerHTML += `
<div class="list-entry">
    <h4 class="jsonkey jsonpart">${jsonkey.replace(" ", "Space")}</h4>
    <h4 class="jsonvalue jsonpart">${tabdata[jsonkey]}</h4>
</div>
        `;
    }
});

moreback.addEventListener("click", function () {
    moreinfo.style.transform = "translateY(500px)";
});


const sitelist = await getSiteList();

try {
    weblist.innerHTML = "";

    if (sitelist.sites.length === 0) {
        weblist.innerHTML = '<h3 id="nodata">No Data.</h3>';
    }

    for (let i in sitelist.sites) {
        console.log(sitelist.sites[i].url);

        await getTypeData(sitelist.sites[i].url)
            .catch((error) => {
                console.error(error);
            });

        const imgurl = `https://www.google.com/s2/favicons?domain=${sitelist.sites[i].url}&sz=12`;

        weblist.innerHTML += `
<div class="entry">
    <a href="${tabdata.fullurl}" target="_blank" title="${tabdata.fullurl}">
        <img class="site-icon" src="${imgurl}">
        <h4>${sitelist.sites[i].url}</h4>
    </a>
    <button class="entry-btn" data-url="${sitelist.sites[i].url}">&rarr;</button>
</div>
        `;
    }
} catch (err) {
    weblist.innerHTML = '<h3 id="nodata">No Data.</h3>';
    console.error(err);
}

for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    entry.addEventListener("click", function () {
        goTo(entry.dataset.url);
    });
}
