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

var tabdata;
var last_space

window.addEventListener("keypress", function (event) {
    const key = event.key;

    console.log(key);

    getTypeData(getCurrentSite());
    console.log("Before:\n" + tabdata);

    if (!(key in tabdata)) {
        tabdata[key] = 0;
    }
    tabdata[key] += 1;;

    if (!("chars" in tabdata)) {
        tabdata["chars"] = 0;
    }
    tabdata.chars += 1;

    console.log("After:\n" + tabdata);
    setTypeData(getCurrentSite());

    console.log("Before:\n" + getSiteList());
    if (!getSiteList().includes(getCurrentSite())) {
        setSiteList(getSiteList().push(getCurrentSite()));
    }
    console.log("After:\n" + getSiteList());
});

function getCurrentSite() {
    return window.location.origin;
}

function getTypeData(site) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(site, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                console.log(`TabData for "${site}" queried`);

                tabdata = JSON.parse(result.tabdata || "{}");
                tabdata["site"] = site;

                console.log(tabdata);

                resolve();
            }
        });
    });
}

function setTypeData(site) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ site: JSON.stringify(tabdata) }, function () {
            console.log(`TypeData for "${site}" setted`);

            resolve();
        });
    });
}

function getSiteList() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["sitelist"], function (result) {
            console.log(`SiteList queried`);

            resolve(JSON.parse(result.sitelist || "{[]}"));
        });
    });
}

function setSiteList(sitelist) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ sitelist: JSON.stringify(sitelist) }, function () {
            console.log(`SiteList setted`);

            resolve();
        });
    });
}
console.log("Typing Statistics - Connected");

getTypeData(getCurrentSite());