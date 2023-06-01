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



const style = getComputedStyle(document.body);



const settings = document.getElementById("settings");
const settingsviewer = document.getElementById("settings-viewer");

const general = document.getElementById("general");
const theme = document.getElementById("theme");
const choices = document.getElementById("choices");
const colorpickers = document.getElementById("colorpickers");

const settingscont = document.getElementById("settings-container");
const settingscancel = document.getElementById("settings-cancel");
const settingsback = document.getElementById("settings-back");
const returntodefault = document.getElementById("returntodefault");
const resetall = document.getElementById("reset-all");



const summary = document.getElementById("summary");
const typetest = document.getElementById("typetest");



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
const deletebtn = document.getElementById("delete");
const moreback = document.getElementById("more-back");
const jsonlist = document.getElementById("json-list");



const typingtest = document.getElementById("typingtest");
const typersback = document.getElementById("typers-back");

const text = document.getElementById("text");
const typefield = document.getElementById("type-field");
const redo = document.getElementById("redo");

const rawwpm = document.getElementById("rawwpm");
const acc = document.getElementById("acc");
const wpm = document.getElementById("wpm");

const incorrectlist = document.getElementById("incorrect-list");



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

function setSiteList(sitelist) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ sitelist: JSON.stringify(sitelist) }, () => {
            console.log("SiteList set");

            console.log("After");
            console.log(sitelist);

            resolve();
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

function removeTypeData(site) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.remove(site, function () {
            console.log(`Key "${site}" has been removed`);

            resolve();
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

function getSettings() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["settings"], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                console.log("Settings queried");

                const config = JSON.parse(result.settings || "{}");

                console.log(config);

                resolve(config);
            }
        });
    });
}

function setSettings(config) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ settings: JSON.stringify(config) }, () => {
            console.log("Settings updated");

            console.log(config);

            resolve();
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

var wpmlength = 0;
var progress = 0;
var correct = 0;
var incorrect = [];
var starttime = 0;

function setLength(len) {
    if (wpmlength != 0) {
        const preWords = document.getElementById("word-" + wpmlength);
        preWords.style.fontSize = "12px";
        preWords.style.marginBottom = "10px";
    }
    wpmlength = len;

    const postWords = document.getElementById("word-" + wpmlength);
    postWords.style.fontSize = "15px";
    postWords.style.marginBottom = "0px";
    redoWPM();
}

function redoWPM() {
    if (wpmlength == 0) {
        setLength('10');
    }

    progress = 0;
    correct = 0;
    incorrect = [];

    typefield.value = "";
    text.innerHTML = "";

    for (var i = 0; i < wpmlength; i++) {
        var word = thewordlist[Math.floor(Math.random() * thewordlist.length)];

        text.innerHTML += `
        <span data-index="${i}">${word} </span>
        `;
    }

    document.querySelectorAll('[data-index]')[progress].classList.add("highlight");
}

async function logEntries() {
    const sitelist = await getSiteList();

    try {
        weblist.innerHTML = "";

        if (!sitelist || !sitelist.sites || sitelist.sites.length == 0 || !Array.isArray(sitelist.sites)) {
            weblist.innerHTML = '<h3 class="nodata">No Data.</h3>';
        }

        for (var i in sitelist.sites) {
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
    <button class="entry-btn" data-url="${sitelist.sites[i].url}">View &rarr;</button>
</div>
        `;
        }
    } catch (err) {
        weblist.innerHTML = '<h3 class="nodata">No Data.</h3>';
        console.error(err);
    }

    for (var i = 0; i < entries.length; i++) {
        const entry = entries[i];

        entry.addEventListener("click", function () {
            goTo(entry.dataset.url);
        });
    }
}

async function logSettings() {
    const config = await getSettings();

    document.getElementById("ext-enabled").checked = config.general.enabled;

    document.getElementById("text2").value = config.theme.text || style.getPropertyValue('--text');
    document.getElementById("text-accent").value = config.theme.text_accent || style.getPropertyValue('--text-accent');
    document.getElementById("text-more-accent").value = config.theme.text_more_accent || style.getPropertyValue('--text-more-accent');

    document.getElementById("bkgd-main").value = config.theme.bkgd_main || style.getPropertyValue('--bkgd-main');
    document.getElementById("bkgd-accent").value = config.theme.bkgd_accent || style.getPropertyValue('--bkgd-accent');
    document.getElementById("bkgd-more-accent").value = config.theme.bkgd_more_accent || style.getPropertyValue('--bkgd-more-accent');

    document.getElementById("other").value = config.theme.other || style.getPropertyValue('--other');

    Chart.defaults.global.defaultFontColor = config.theme.text || style.getPropertyValue('--text');

    document.documentElement.style.setProperty('--text', config.theme.text || style.getPropertyValue('--text'));
    document.documentElement.style.setProperty('--text-accent', config.theme.text_accent || style.getPropertyValue('--text-accent'));
    document.documentElement.style.setProperty('--text-more-accent', config.theme.text_more_accent || style.getPropertyValue('--text-more-accent'));

    document.documentElement.style.setProperty('--bkgd-main', config.theme.bkgd_main || style.getPropertyValue('--bkgd-main'));
    document.documentElement.style.setProperty('--bkgd-accent', config.theme.bkgd_accent || style.getPropertyValue('--bkgd-accent'));
    document.documentElement.style.setProperty('--bkgd-more-accent', config.theme.bkgd_more_accent || style.getPropertyValue('--bkgd-more-accent'));

    document.documentElement.style.setProperty('--other', config.theme.other || style.getPropertyValue('--other'));
}

var xyRawWPMValues = [];
var xyWPMValues = [];
var xyACCValues = [];
var valCount = 1;
var NumLabels = [];

new Chart("rawwpmprogresschart", {
    type: "line",
    data: {
        labels: NumLabels,
        datasets: [{
            fill: true,
            lineTension: 0,
            backgroundColor: "#71d4fe50",
            borderColor: "#71d4fe",
            data: xyRawWPMValues
        }]
    },
    options: {
        legend: { display: false },
        scales: {
            yAxes: [{
                ticks: { min: 0 },
                scaleLabel: {
                    display: true,
                    labelString: 'Raw WPM'
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Test #'
                }
            }]
        }
    }
});

new Chart("wpmprogresschart", {
    type: "line",
    data: {
        labels: NumLabels,
        datasets: [{
            fill: true,
            lineTension: 0,
            backgroundColor: "#71d4fe50",
            borderColor: "#71d4fe",
            data: xyWPMValues
        }]
    },
    options: {
        legend: { display: false },
        scales: {
            yAxes: [{
                ticks: { min: 0 },
                scaleLabel: {
                    display: true,
                    labelString: 'WPM'
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Test #'
                }
            }]
        }
    }
});

new Chart("accprogresschart", {
    type: "line",
    data: {
        labels: NumLabels,
        datasets: [{
            fill: true,
            lineTension: 0,
            backgroundColor: "#71d4fe50",
            borderColor: "#71d4fe",
            data: xyACCValues
        }]
    },
    options: {
        legend: { display: false },
        scales: {
            yAxes: [{
                ticks: { min: 0, max: 100 },
                scaleLabel: {
                    display: true,
                    labelString: 'Accuracy'
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Test #'
                }
            }]
        }
    }
});

function highlightNext(word) {
    if (progress >= wpmlength) {
        return;
    }

    const current = document.querySelectorAll('[data-index]')[progress];

    var target = current.innerHTML;

    if (word.charAt(0) == " ") {
        target = " " + target;
    }

    if ((word + " ") === target) {
        current.classList.add("correct");
        correct += 1;
    } else {
        current.classList.add("wrong");
        incorrect.push(("<span>" + target + "</span>"));
    }

    progress += 1;

    if (progress == wpmlength) {
        rawwpm.innerHTML = Math.round(60000 / ((Date.now() - starttime) / wpmlength));
        acc.innerHTML = Math.round((correct / wpmlength) * 100);
        wpm.innerHTML = Math.round(rawwpm.innerHTML * (acc.innerHTML / 100));

        incorrectlist.innerHTML = "";

        if (incorrect.length == 0) {
            incorrectlist.innerHTML = `
<div class="nodata correct">
    All Correct!
</div>
            `;
        }

        for (var i = 0; i < incorrect.length; i++) {
            incorrectlist.innerHTML += `
                <li>${incorrect[i]}</li>
            `;
        }

        NumLabels.push(valCount);

        xyRawWPMValues.push({ x: Number(valCount), y: Number(rawwpm.innerHTML) });

        new Chart("rawwpmprogresschart", {
            type: "line",
            data: {
                labels: NumLabels,
                datasets: [{
                    fill: true,
                    lineTension: 0,
                    backgroundColor: "#71d4fe50",
                    borderColor: "#71d4fe",
                    data: xyRawWPMValues
                }]
            },
            options: {
                legend: { display: false },
                scales: {
                    yAxes: [{
                        ticks: { min: 0 },
                        scaleLabel: {
                            display: true,
                            labelString: 'Raw WPM'
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Test #'
                        }
                    }]
                }
            }
        });

        xyWPMValues.push({ x: Number(valCount), y: Number(wpm.innerHTML) });

        new Chart("wpmprogresschart", {
            type: "line",
            data: {
                labels: NumLabels,
                datasets: [{
                    fill: true,
                    lineTension: 0,
                    backgroundColor: "#71d4fe50",
                    borderColor: "#71d4fe",
                    data: xyWPMValues
                }]
            },
            options: {
                legend: { display: false },
                scales: {
                    yAxes: [{
                        ticks: { min: 0 },
                        scaleLabel: {
                            display: true,
                            labelString: 'WPM'
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Test #'
                        }
                    }]
                }
            }
        });

        xyACCValues.push({ x: Number(valCount), y: Number(acc.innerHTML) });

        new Chart("accprogresschart", {
            type: "line",
            data: {
                labels: NumLabels,
                datasets: [{
                    fill: true,
                    lineTension: 0,
                    backgroundColor: "#71d4fe50",
                    borderColor: "#71d4fe",
                    data: xyACCValues
                }]
            },
            options: {
                legend: { display: false },
                scales: {
                    yAxes: [{
                        ticks: { min: 0, max: 100 },
                        scaleLabel: {
                            display: true,
                            labelString: 'Accuracy'
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Test #'
                        }
                    }]
                }
            }
        });

        valCount += 1;

        document.getElementById("upper").scrollIntoView({
            top: 0,
            behavior: "smooth"
        });
    } else {
        document.querySelectorAll('[data-index]')[progress].classList.add("highlight");
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function assignGrade(wpm) {
    if (wpm >= 200) {
        return 'hecker';
    } else if (wpm >= 140) {
        return 'SSS+';
    } else if (wpm >= 135) {
        return 'SSS';
    } else if (wpm >= 130) {
        return 'SSS-';
    } else if (wpm >= 125) {
        return 'SS+';
    } else if (wpm >= 120) {
        return 'SS';
    } else if (wpm >= 115) {
        return 'SS-';
    } else if (wpm >= 110) {
        return 'S+';
    } else if (wpm >= 105) {
        return 'S';
    } else if (wpm >= 100) {
        return 'S-';
    } else if (wpm >= 95) {
        return 'A+';
    } else if (wpm >= 90) {
        return 'A';
    } else if (wpm >= 85) {
        return 'A-';
    } else if (wpm >= 80) {
        return 'B+';
    } else if (wpm >= 75) {
        return 'B';
    } else if (wpm >= 70) {
        return 'B-';
    } else if (wpm >= 65) {
        return 'C+';
    } else if (wpm >= 60) {
        return 'C';
    } else if (wpm >= 55) {
        return 'C-';
    } else if (wpm >= 50) {
        return 'D+';
    } else if (wpm >= 45) {
        return 'D';
    } else if (wpm >= 40) {
        return 'D-';
    } else if (wpm >= 35) {
        return 'E+';
    } else if (wpm >= 30) {
        return 'E';
    } else if (wpm >= 25) {
        return 'E-';
    } else {
        return 'F';
    }
}

function getFreq(key) {
    return tabdata[key];
}

async function getCurrentTab() {
    var queryOptions = { active: true, lastFocusedWindow: true };
    var [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

settings.addEventListener("click", async function () {
    const config = await getSettings();

    document.getElementById("ext-enabled").checked = config.general.enabled;

    document.getElementById("text2").value = config.theme.text || style.getPropertyValue('--text');
    document.getElementById("text-accent").value = config.theme.text_accent || style.getPropertyValue('--text-accent');
    document.getElementById("text-more-accent").value = config.theme.text_more_accent || style.getPropertyValue('--text-more-accent');

    document.getElementById("bkgd-main").value = config.theme.bkgd_main || style.getPropertyValue('--bkgd-main');
    document.getElementById("bkgd-accent").value = config.theme.bkgd_accent || style.getPropertyValue('--bkgd-accent');
    document.getElementById("bkgd-more-accent").value = config.theme.bkgd_more_accent || style.getPropertyValue('--bkgd-more-accent');

    document.getElementById("other").value = config.theme.other || style.getPropertyValue('--other');

    settingsviewer.style.transform = "translateY(0px)";
});

settingscancel.addEventListener("click", function () {
    logSettings();

    settingsviewer.style.transform = "translateY(-500px)";
});

settingsback.addEventListener("click", async function () {
    const enabled = document.getElementById("ext-enabled").checked;

    const text = document.getElementById("text2").value;
    const text_accent = document.getElementById("text-accent").value;
    const text_more_accent = document.getElementById("text-more-accent").value;

    const bkgd_main = document.getElementById("bkgd-main").value;
    const bkgd_accent = document.getElementById("bkgd-accent").value;
    const bkgd_more_accent = document.getElementById("bkgd-more-accent").value;

    const other = document.getElementById("other").value;

    Chart.defaults.global.defaultFontColor = text;

    document.documentElement.style.setProperty('--text', text);
    document.documentElement.style.setProperty('--text-accent', text_accent);
    document.documentElement.style.setProperty('--text-more-accent', text_more_accent);

    document.documentElement.style.setProperty('--bkgd-main', bkgd_main);
    document.documentElement.style.setProperty('--bkgd-accent', bkgd_accent);
    document.documentElement.style.setProperty('--bkgd-more-accent', bkgd_more_accent);

    document.documentElement.style.setProperty('--other', other);

    const body = {
        general: {
            enabled: enabled
        },
        theme: {
            text: text,
            text_accent: text_accent,
            text_more_accent: text_more_accent,

            bkgd_main: bkgd_main,
            bkgd_accent: bkgd_accent,
            bkgd_more_accent: bkgd_more_accent,

            other: other
        }
    }

    await setSettings(body);

    if (!body.general.enabled) {
        chrome.action.setIcon({ path: "../assets/typing-statistics-disabled.png" });
    } else {
        chrome.action.setIcon({ path: "../assets/typing-statistics.png" });
    }

    settingsviewer.style.transform = "translateY(-500px)";
});

general.addEventListener("click", function () {
    settingscont.style.transform = "rotateY(0deg)";

    general.style.filter = "none";
    theme.style.filter = "blur(1px)";

    general.style.textDecoration = "bold";
    theme.style.textDecoration = "none";

    setTimeout(function () {
        colorpickers.style.display = "none";
        choices.style.display = "block";
    }, 100);
});

theme.addEventListener("click", function () {
    settingscont.style.transform = "rotateY(180deg)";

    general.style.filter = "blur(1px)";
    theme.style.filter = "none";

    general.style.textDecoration = "none";
    theme.style.textDecoration = "bold";

    setTimeout(function () {
        colorpickers.style.display = "block";
        choices.style.display = "none";
    }, 100);
});

resetall.addEventListener("click", async function () {
    console.log("Reset requested");

    const sites = await getSiteList();

    for (var i in sites.sites) {
        await removeTypeData(sites.sites[i].url);
    }

    await removeTypeData("sitelist");

    logEntries();
});

returntodefault.addEventListener("click", function () {
    document.getElementById("text2").value = style.getPropertyValue('--text-default');
    document.getElementById("text-accent").value = style.getPropertyValue('--text-accent-default');
    document.getElementById("text-more-accent").value = style.getPropertyValue('--text-more-accent-default');

    document.getElementById("bkgd-main").value = style.getPropertyValue('--bkgd-main-default');
    document.getElementById("bkgd-accent").value = style.getPropertyValue('--bkgd-accent-default');
    document.getElementById("bkgd-more-accent").value = style.getPropertyValue('--bkgd-more-accent-default');

    document.getElementById("other").value = style.getPropertyValue('--other-default');
});

summary.addEventListener("click", async function () {
    console.log("View all");

    tabdata = {};

    title.innerHTML = "Summary";

    const sitelist = await getSiteList();

    var cumulativeWPM = 0;

    for (var i in sitelist.sites) {
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

    leftmain.innerHTML = tabdata.chars || 0;
    rightmain.innerHTML = cumulativeWPM / sitelist.sites.length;
    rightmain.innerHTML = (Math.round(((Number(rightmain.innerHTML)) + Number.EPSILON) * 100) / 100) || 0;

    centermain.innerHTML = assignGrade(rightmain.innerHTML);

    viewer.style.transform = "translateX(0px)";
});

const title_cont = document.getElementsByClassName("title-cont")[0];
title_cont.addEventListener('mouseenter', () => {
    const textWidth = title.clientWidth;
    const boxWidth = parseFloat(getComputedStyle(title_cont).width);
    const translateVal = Math.min(boxWidth - textWidth, 0);
    title.style.transitionDuration = "3s";
    title.style.transform = "translateX(" + (translateVal - 10) + "px)";
});
title_cont.addEventListener('mouseleave', () => {
    title.style.transitionDuration = "300ms";
    title.style.transform = "translateX(0)";
});

redo.addEventListener("click", function () {
    redoWPM();
});

typefield.addEventListener("keydown", function (event) {
    if (progress == 0) {
        if (typefield.value.length == 1) {
            starttime = Date.now();
        }
    }

    if (event.key === " ") {
        const word = typefield.value;
        typefield.value = "";
        highlightNext(word);
    }

    if (progress == wpmlength - 1) {
        const current = document.querySelectorAll('[data-index]')[progress];
        var target = current.innerHTML;

        var word = typefield.value + event.key;
        if (word.charAt(0) == " ") {
            target = " " + target;
        }

        if ((word + " ") == target) {
            highlightNext(word);
        }
    }
});

document.querySelectorAll(".words").forEach(function (word) {
    word.addEventListener('click', function () {
        setLength(word.dataset.count);
    });
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
    <h4 class="jsonkey jsonpart">${jsonkey.replace(" ", "space")}</h4>
    <h4 class="jsonvalue jsonpart">${(Math.round(((tabdata[jsonkey]) + Number.EPSILON) * 100) / 100) || tabdata[jsonkey]}</h4 >
</div >
    `;
    }
});

deletebtn.addEventListener("click", async function () {
    await removeTypeData(tabdata.site);

    const sitelist = await getSiteList();

    var newsitelist = { sites: [] };

    for (var i in sitelist.sites) {
        if (sitelist.sites[i].url != tabdata.site) {
            newsitelist.sites.push({ url: sitelist.sites[i].url });
        }
    }

    await setSiteList(newsitelist);

    logEntries();

    back.click();
});

moreback.addEventListener("click", function () {
    moreinfo.style.transform = "translateY(500px)";
});

typetest.addEventListener("click", function () {
    typingtest.style.transform = "translateX(0px)";
    redoWPM();
});

typersback.addEventListener("click", function () {
    typingtest.style.transform = "translateX(-300px)";
});

logEntries();

logSettings();

const thewordlist = ["the", "be", "and", "of", "a", "in", "to", "have", "to", "it", "I", "that", "for", "you", "he", "with", "on", "do", "say", "this", "they", "at", "but", "we", "his", "from", "that", "by", "she", "or", "as", "what", "go", "their", "can", "who", "get", "if", "would", "her", "all", "my", "make", "about", "know", "will", "as", "up", "one", "time", "there", "year", "so", "think", "when", "which", "them", "some", "me", "people", "ta", "out", "into", "just", "see", "him", "your", "come", "could", "now", "than", "like", "other", "how", "then", "its", "our", "two", "more", "these", "want", "way", "look", "first", "also", "new", "because", "day", "more", "use", "no", "man", "find", "here", "thing", "give", "ma", "well", "only", "those", "tell", "one", "very", "her", "even", "back", "any", "good", "woman", "through", "us", "life", "child", "there", "work", "down", "may", "after", "should", "call", "world", "over", "school", "still", "try", "in", "as", "last", "ask", "need", "too", "feel", "three", "when", "state", "never", "become", "between", "high", "really", "something", "most", "another", "much", "family", "own", "out", "leave", "put", "old", "while", "mean", "on", "keep", "student", "why", "let", "great", "same", "big", "group", "begin", "seem", "country", "help", "talk", "where", "turn", "problem", "every", "start", "hand", "might", "American", "show", "part", "about", "against", "place", "over", "such", "again", "few", "case", "most", "week", "company", "where", "system", "each", "right", "program", "hear", "so", "question", "during", "work", "play", "government", "run", "small", "number", "off", "always", "move", "like", "night", "live", "point", "believe", "hold", "today", "bring", "happen", "next", "without", "before", "large", "all", "million", "must", "home", "under", "water", "room", "write", "mother", "area", "national", "money", "story", "young", "fact", "month", "different", "lot", "right", "study", "book", "job", "word", "though", "business", "issue", "side", "kind", "four", "head", "far", "black", "long", "both", "little", "house", "yes", "after", "since", "long", "provide", "service", "around", "friend", "important", "father", "sit", "away", "until", "power", "hour", "game", "often", "yet", "line", "political", "end", "among", "ever", "stand", "bad", "lose", "however", "member", "pay", "law", "meet", "car", "city", "almost", "include", "continue", "set", "later", "community", "much", "name", "five", "once", "white", "least", "president", "learn", "real", "change", "team", "minute", "best", "several", "idea", "kid", "body", "information", "nothing", "ago", "right", "lead", "social", "understand", "whether", "back", "watch", "together", "follow", "around", "parent", "only", "stop", "face", "anything", "create", "public", "already", "speak", "others", "read", "level", "allow", "add", "office", "spend", "door", "health", "person", "sure", "such", "war", "history", "party", "within", "grow", "result", "open", "change", "morning", "walk", "reason", "low", "win", "research", "girl", "guy", "early", "food", "before", "moment", "himself", "air", "teacher", "force", "offer", "enough", "both", "education", "across", "although", "remember", "foot", "second", "boy", "maybe", "toward", "able", "age", "off", "policy", "everything", "love", "process", "music", "including", "consider", "appear", "actually", "buy", "probably", "human", "wait", "serve", "market", "die", "send", "expect", "home", "sense", "build", "stay", "fall", "oh", "nation", "plan", "cut", "college", "interest", "death", "course", "someone", "experience", "behind", "reach", "local", "kill", "six", "remain", "effect", "use", "yeah", "suggest", "class", "control", "raise", "care", "perhaps", "little", "late", "hard", "field", "else", "pass", "former", "sell", "major", "sometimes", "require", "along", "development", "themselves", "report", "role", "better", "economic", "effort", "up", "decide", "rate", "strong", "possible", "heart", "drug", "show", "leader", "light", "voice", "wife", "whole", "police", "mind", "finally", "pull", "return", "free", "military", "price", "report", "less", "according", "decision", "explain", "son", "hope", "even", "develop", "view", "relationship", "carry", "town", "road", "drive", "arm", "true", "federal", "break", "better", "difference", "thank", "receive", "value", "international", "building", "action", "full", "model", "join", "season", "society", "because", "tax", "director", "early", "position", "player", "agree", "especially", "record", "pick", "wear", "paper", "special", "space", "ground", "form", "support", "event", "official", "whose", "matter", "everyone", "cent", "couple", "site", "end", "project", "hit", "base", "activity", "star", "table", "need", "court", "produce", "eat", "American", "teach", "oil", "half", "situation", "easy", "cost", "industry", "figure", "face", "street", "image", "itself", "phone", "either", "data", "cover", "quite", "picture", "clear", "practice", "piece", "land", "recent", "describe", "product", "doctor", "wall", "patient", "worker", "news", "test", "movie", "certain", "north", "love", "personal", "open", "support", "simply", "third", "technology", "catch", "step", "baby", "computer", "type", "attention", "draw", "film", "Republican", "tree", "source", "red", "nearly", "organization", "choose", "cause", "hair", "look", "point", "century", "evidence", "window", "difficult", "listen", "soon", "culture", "billion", "chance", "brother", "energy", "period", "course", "summer", "less", "realize", "hundred", "available", "plant", "likely", "opportunity", "term", "short", "letter", "condition", "choice", "place", "single", "rule", "daughter", "administration", "south", "husband", "Congress", "floor", "campaign", "material", "population", "well", "call", "economy", "medical", "hospital", "church", "close", "thousand", "risk", "current", "fire", "future", "wrong", "involve", "defense", "anyone", "increase", "security", "bank", "myself", "certainly", "west", "sport", "board", "seek", "per", "subject", "officer", "private", "rest", "behavior", "deal", "performance", "fight", "throw", "top", "quickly", "past", "goal", "second", "bed", "order", "author", "fill", "represent", "focus", "foreign", "drop", "plan", "blood", "upon", "agency", "push", "nature", "color", "no", "recently", "store", "reduce", "sound", "note", "fine", "before", "near", "movement", "page", "enter", "share", "than", "common", "poor", "other", "natural", "race", "concern", "series", "significant", "similar", "hot", "language", "each", "usually", "response", "dead", "rise", "animal", "factor", "decade", "article", "shoot", "east", "save", "seven", "artist", "away", "scene", "stock", "career", "despite", "central", "eight", "thus", "treatment", "beyond", "happy", "exactly", "protect", "approach", "lie", "size", "dog", "fund", "serious", "occur", "media", "ready", "sign", "thought", "list", "individual", "simple", "quality", "pressure", "accept", "answer", "hard", "resource", "identify", "left", "meeting", "determine", "prepare", "disease", "whatever", "success", "argue", "cup", "particularly", "amount", "ability", "staff", "recognize", "indicate", "character", "growth", "loss", "degree", "wonder", "attack", "herself", "region", "television", "box", "training", "pretty", "trade", "deal", "election", "everybody", "physical", "lay", "general", "feeling", "standard", "bill", "message", "fail", "outside", "arrive", "analysis", "benefit", "name", "sex", "forward", "lawyer", "present", "section", "environmental", "glass", "answer", "skill", "sister", "professor", "operation", "financial", "crime", "stage", "OK", "compare", "authority", "miss", "design", "sort", "one", "act", "ten", "knowledge", "gun", "station", "blue", "state", "strategy", "little", "clearly", "discuss", "indeed", "force", "truth", "song", "example", "democratic", "check", "environment", "leg", "dark", "public", "various", "rather", "laugh", "guess", "executive", "set", "study", "prove", "hang", "entire", "rock", "design", "enough", "forget", "since", "claim", "note", "remove", "manager", "help", "close", "sound", "enjoy", "network", "legal", "religious", "cold", "form", "final", "main", "science", "green", "memory", "card", "above", "seat", "cell", "establish", "nice", "trial", "expert", "that", "spring", "firm", "Democrat", "radio", "visit", "management", "care", "avoid", "imagine", "tonight", "huge", "ball", "no", "close", "finish", "yourself", "talk", "theory", "impact", "respond", "statement", "maintain", "charge", "popular", "traditional", "onto", "reveal", "direction", "weapon", "employee", "cultural", "contain", "peace", "head", "control", "base", "pain", "apply", "play", "measure", "wide", "shake", "fly", "interview", "manage", "chair", "fish", "particular", "camera", "structure", "politics", "perform", "bit", "weight", "suddenly", "discover", "candidate", "top", "production", "treat", "trip", "evening", "affect", "inside", "conference", "unit", "best", "style", "adult", "worry", "range", "mention", "rather", "far", "deep", "past", "edge", "individual", "specific", "writer", "trouble", "necessary", "throughout", "challenge", "fear", "shoulder", "institution", "middle", "sea", "dream", "bar", "beautiful", "property", "instead", "improve", "stuff", "detail", "method", "sign", "somebody", "magazine", "hotel", "soldier", "reflect", "heavy", "sexual", "cause", "bag", "heat", "fall", "marriage", "tough", "sing", "surface", "purpose", "exist", "pattern", "whom", "skin", "agent", "owner", "machine", "gas", "down", "ahead", "generation", "commercial", "address", "cancer", "test", "item", "reality", "coach", "step", "Mrs", "yard", "beat", "violence", "total", "tend", "investment", "discussion", "finger", "garden", "notice", "collection", "modern", "task", "partner", "positive", "civil", "kitchen", "consumer", "shot", "budget", "wish", "painting", "scientist", "safe", "agreement", "capital", "mouth", "nor", "victim", "newspaper", "instead", "threat", "responsibility", "smile", "attorney", "score", "account", "interesting", "break", "audience", "rich", "dinner", "figure", "vote", "western", "relate", "travel", "debate", "prevent", "citizen", "majority", "none", "front", "born", "admit", "senior", "assume", "wind", "key", "professional", "mission", "fast", "alone", "customer", "suffer", "speech", "successful", "option", "participant"]