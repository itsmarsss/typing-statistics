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

    if (!getSiteList().includes(getCurrentSite())) {
        setSiteList(getSiteList().push(getCurrentSite()));
    }
});

function getCurrentSite() {
    return window.location.hostname;
}

const getTypeData = async (site) => {
    return new Promise((resolve) => {
        chrome.storage.local.get([site], function (result) {
            console.log(`TabData for "${site}" queried`);

            tabdata = JSON.parse(result.tabdata) || {};
            tabdata["site"] = site;

            console.log(tabdata);

            resolve();
        });
    });
}

const setTypeData = async (site) => {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [site]: JSON.stringify(tabdata) }, function () {
            console.log(`TypeData for "${site}" setted`);

            resolve();
        });
    });
}

const getSiteList = async () => {
    return new Promise((resolve) => {
        chrome.storage.local.get(["sitelist"], function (result) {
            console.log(`SiteList queried`);

            resolve(JSON.parse(result.sitelist) || []);
        });
    });
}

const setSiteList = async (sitelist) => {
    return new Promise((resolve) => {
        chrome.storage.local.set({ sitelist: JSON.stringify(sitelist) }, function () {
            console.log(`SiteList setted`);

            resolve();
        });
    });
}
console.log("Typing Statistics - Connected");

async function getData() {
    await getTypeData();
}

getData();
