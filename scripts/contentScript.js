var tabdata = {};
var last_space = -1;
var length = 0;

async function updateTabData(key) {
    await getTypeData(getCurrentSite());

    if (!(fullurl in tabdata)) {
        tabdata[fullurl] = getFullCurrentSite();
    }

    if (!(key in tabdata)) {
        tabdata[key] = 0;
    }
    tabdata[key] += 1;

    if (!("chars" in tabdata)) {
        tabdata["chars"] = 0;
    }
    tabdata.chars += 1;

    length += 1;

    if (key === " ") {
        if ((last_space === -1) || (Date.now() - last_space > 5000)) {
            last_space = Date.now();
        } else {
            if (!("words" in tabdata)) {
                tabdata["words"] = 0;
            }
            tabdata.words += 1;

            if (!("avgtime" in tabdata)) {
                tabdata["avgtime"] = Date.now() - last_space;
            } else {
                tabdata.avgtime = ((tabdata.avgtime * (tabdata.words - 1) + (Date.now() - last_space)) / tabdata.words);
            }
            console.log(Date.now() - last_space);

            length = 0;
            last_space = Date.now();
        }
    }

    await setTypeData(getCurrentSite());
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
            sitelist.sites.push({ url: currentSite });
        }

        await setSiteList(sitelist);
        console.log("Afters:");
        console.log(await getSiteList());
    } catch (error) {
        console.error(error);
    }
}

function getCurrentSite() {
    return window.location.hostname;
}

function getFullCurrentSite() {
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

document.addEventListener('keydown', function (event) {
    const key = event.key.toLowerCase();
    updateTabData(key);
    updateSiteList();
});

addKeyListenerToElements(document.documentElement);

console.log("Typing Statistics - Connected");

getTypeData(getCurrentSite())
    .catch((error) => {
        console.error(error);
    });