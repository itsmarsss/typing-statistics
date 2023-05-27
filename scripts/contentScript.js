var tabdata = {};
var last_space;

window.addEventListener("keypress", function (event) {
    const key = event.key;
    updateTabData(key);
    updateSiteList();
});

function updateTabData(key) {
    getTypeData(getCurrentSite())
        .then(() => {
            if (!(key in tabdata)) {
                tabdata[key] = 0;
            }
            tabdata[key] += 1;

            if (!("chars" in tabdata)) {
                tabdata["chars"] = 0;
            }
            tabdata.chars += 1;

            setTypeData(getCurrentSite());
        })
        .catch((error) => {
            console.error(error);
        });
}

async function updateSiteList() {
    try {
        const sitelist = await getSiteList();
        const currentSite = getCurrentSite();

        if (!sitelist || !sitelist.sites || !Array.isArray(sitelist.sites)) {
            sitelist = { sites: [] };
        }

        let siteExists = false;
        for (let i = 0; i < sitelist.sites.length; i++) {
            if (sitelist.sites[i].url === currentSite) {
                siteExists = true;
                break;
            }
        }

        if (!siteExists) {
            sitelist.sites.push({ url: currentSite, chars: 0, wpm: 0 });
        }

        await setSiteList(sitelist);
        console.log("Afters:");
        console.log(await getSiteList());
    } catch (error) {
        console.error(error);
    }
}

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

                tabdata = JSON.parse(result[site] || "{}");
                tabdata.site = site;

                console.log("Before");
                console.log(tabdata);

                resolve();
            }
        });
    });
}

function setTypeData(site) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [site]: JSON.stringify(tabdata) }, () => {
            console.log(`TypeData for "${site}" set`);

            console.log("After");
            console.log(tabdata);

            resolve();
        });
    });
}

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

console.log("Typing Statistics - Connected");

getTypeData(getCurrentSite())
    .catch((error) => {
        console.error(error);
    });