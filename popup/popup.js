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

var typedata;

function getTypeData() {
    chrome.storage.local.get(["typedata"], function (result) {
        console.log("TypeData queried");
        typedata = JSON.parse(result.typedata);
        console.log(typedata);
    });
}

function setTypeData() {
    chrome.storage.local.set({ typedata: JSON.stringify(typedata) }, function () {
        console.log("TypeData setted");
    });
}

function goTo(site) {

}

getTypeData();

for (let i in typedata.sites) {
    console.log(typedata.sites[i]);
    weblist.innerHTML += `
    <div class="entry" onclick="goTo(${typedata.sites[i]})">
        <h4>${typedata.sites[i]}</h4>
        <button>&rarr;</button>
    </div>
    `;
}
