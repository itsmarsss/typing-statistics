const count = document.getElementById('count');

var tabmap = new Map();

const readLocalStorage = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["tabdata"], function (result) {
            console.log("Get");
            tabmap = new Map(Object.entries(result.tabdata));
            resolve();
        });

    });
};

await readLocalStorage();

for (let [key, value] of tabmap) {

    console.log(key + " = " + value);

}

const mapArray = Array.from(tabmap);

mapArray.sort((a, b) => b[1] - a[1]);

const sortedMap = new Map(mapArray);


for (let [key, value] of sortedMap) {

    let domain = (new URL(key));
    domain = domain.hostname;

    count.innerHTML += `
<div class="entry">
    <h4>${domain}</h4>
    <h3>${value}</h3>
</div>
    `;

}