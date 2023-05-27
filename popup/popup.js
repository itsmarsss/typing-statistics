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
const entries = document.getElementsByClassName("entry");

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

function goTo(site) {

}

for (let i = 0; i < entries.length; i++) {
    const entry = elements[i];

    entry.addEventListener("click", function () {
        goTo(entry.dataset.url);
    });
}

const sitelist = await getSiteList();

for (let i in sitelist.sites) {
    console.log(sitelist.sites[i].url);
    weblist.innerHTML += `
    <div class="entry" data-url="${sitelist.sites[i].url}">
        <h4>${sitelist.sites[i].url}</h4>
        <button>&rarr;</button>
    </div>
    `;
}
