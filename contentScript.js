window.addEventListener("keypress", async (event) => {
    console.log(event.code);

    await readLocalStorage();

    if(tabmap.has(getBaseURL())) {
        tabmap.set(getBaseURL(), tabmap.get(getBaseURL())+1);
    }else {
        tabmap.set(getBaseURL(), 1);
    }
    
    await setLocalStorage();
    
    const obj = Object.fromEntries(tabmap);
    console.log(obj);
});

var tabmap = new Map();

const setLocalStorage = async () => {
    return new Promise((resolve, reject) => {
    const obj = Object.fromEntries(tabmap);
        chrome.storage.local.set({ tabdata: obj }, function () {
            console.log("Set");
            resolve();
        });
        
    });
};

const readLocalStorage = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["tabdata"], function (result) {
            console.log("Get");
            tabmap = new Map(Object.entries(result.tabdata));
            resolve();
        });

    });
};

function getBaseURL() {
    const baseURL = window.location.origin;
    console.log('Base URL:', baseURL);
    return baseURL;
}

/*

const map1 = new Map([
  ['foo', 'bar'],
  ['baz', 42]
]);

*/
