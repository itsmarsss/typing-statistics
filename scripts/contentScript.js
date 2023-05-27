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

var typedata;
var last_space

window.addEventListener("keypress", function (event) {
    const key = event.key;

    console.log(key);

    if (!"chars" in typedata.sites[getSite()]) {
        typedata.sites[getSite()]["chars"] = 0;
    }
    typedata.sites[getSite()].chars += 1;;

    if (!"chars" in typedata.sites[getSite()]) {
        typedata.sites[getSite()]["chars"] = 0;
    }
    typedata.keys[key] += 1;

    console.log(typedata);
});

function getCurrentSite() {
    return window.location.hostname;
}

const getTypeData = async () => {
    return new Promise((resolve) => {
        chrome.storage.local.get(["typedata"], function (result) {
            console.log("TypeData queried");
            typedata = JSON.parse(result.typedata);
            console.log(typedata);

            resolve();
        });
    });
}


const setTypeData = async () => {
    return new Promise((resolve) => {
        chrome.storage.local.set({ typedata: JSON.stringify(typedata) }, function () {
            console.log("TypeData setted");

            resolve();
        });
    });
}

console.log("Typing Statistics - Connected");

async function getData() {
    await getTypeData();
}

getData();
