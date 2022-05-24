// ----------------------------------------------------------------------------
// Exchange data with the YouTube page
// ----------------------------------------------------------------------------

async function requestInfo(sec){
    const tab = await getCurrentTab();
    chrome.tabs.sendMessage(tab.id, { type: "info", sec }, (res) => { console.log(res); });
}

async function requestPlayVideo(){
    const tab = await getCurrentTab();
    chrome.tabs.sendMessage(tab.id, { type: "play" }, (res) => { console.log(res); });
}

async function requestPauseVideo(){
    const tab = await getCurrentTab();
    chrome.tabs.sendMessage(tab.id, { type: "pause" }, (res) => { console.log(res); });
}

async function getCurrentTab(){
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(sender.tab){ // message was from content.js
        console.log("message from content.js to popup.js")
        info = request.info;
        showInfo(info);
        show();
        sendResponse({});
    }
});

let info;

function showInfo(info){
    document.getElementById("url").innerText = info.url;
    document.getElementById("duration").innerText = info.duration;
    document.getElementById("time").innerText = info.time;
    document.getElementById("captionText").value = info.caption;
}

// ----------------------------------------------------------------------------
// User Interface Event Handlers
// ----------------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
    load();
    requestInfo(0);
    requestPauseVideo();
});

window.addEventListener("blur", () => {
    requestPlayVideo();
});

document.getElementById("backButton").addEventListener("click", () => {
    console.log("back");
    requestInfo(-2);
});

document.getElementById("forwardButton").addEventListener("click", () => {
    console.log("forward");
    requestInfo(2);
});

document.getElementById("scrapButton").addEventListener("click", scrap);
document.getElementById("sortButton").addEventListener("click", filterScrap);
document.getElementById("download").addEventListener("click", handleDownload);

function scrap(){
    const { url, time } = info;
    const caption = document.getElementById("captionText").value;
    const captionTag = document.getElementById("captionTag").value;

    if(!caption){
        alert("Nothing to scrap.");
        return;
    }

    scrapbook.push({ url: adjustUrlTime(url, -5), time, caption, captionTag });

    if(captionTag){
        tags.add(captionTag);
    }

    save();
    show();
}

function adjustUrlTime(urlString, dt){
    const url = new URL(urlString);
    const params = url.searchParams;
    const t = Number(params.get("t")) + dt;
    params.set("t", t);
    return url.toString();
}

function filterScrap(){　//フィルター設定
    const options = document.getElementsByName('options');
    const selectedTags = Array.from(options).filter(o => o.checked).map(o => o.value);

    console.log(selectedTags);

    const rows = document.getElementById('scrapTable').children;
    for(let i = 0; i < rows.length; i++){
        const row = rows[i];
        row.hidden = !selectedTags.includes(row.dataset.tag);
    }
}

// ----------------------------------------------------------------------------
// Data and Storage
// ----------------------------------------------------------------------------

const presetTags = [ '会話を切り出す', '相手に尋ねる', 'お願いする', '相槌', '感情を表現する' ];

const scrapbook = [];
const tags = new Set();

function save(){
    chrome.storage.local.set({ scrapbook, tags: [...tags] }, () => {

    });
}

function load(){
    chrome.storage.local.get({ scrapbook: [], tags: presetTags }, (data) => {
        if(data.scrapbook){
            data.scrapbook.forEach(s => scrapbook.push(s));
        }
        if(data.tags){
            if(data.tags.length > 0){
                data.tags.forEach(tag => tags.add(tag));
            }
            else{
                presetTags.forEach(tag => tags.add(tag));
            }
        }
    });
}

function show(){
    const rows = scrapbook.map((item, index) => {
        const tr = document.createElement('tr');

        const a = document.createElement('a');
        a.textContent = 'Check this phrase';
        a.classList.add('checkPhrase');
        setAttributes(a, { href: item.url, target: '_blank', rel: 'noopener noreferrer'});

        const btn = document.createElement('button');
        btn.textContent = 'delete';
        btn.classList.add('deleteButton');
        setAttributes(btn, { type: 'button' });
        btn.addEventListener('click', () => {
            scrapbook.splice(index, 1);
            save();
            show();
        });

        const cols = [ document.createTextNode(item.caption), document.createTextNode('#' + item.captionTag), a, btn ];

        for(const n of cols){
            const td = document.createElement('td');
            td.appendChild(n);
            tr.appendChild(td);
        }

        tr.dataset.tag = item.captionTag;

        return tr;
    });

    document.getElementById('scrapTable').replaceChildren(...rows);

    const tagArray = Array.from(tags);

    const tagListItems = tagArray.map(tag => {
        const li = document.createElement('li');
        li.textContent = tag;
        li.classList.add('taglist');
        li.addEventListener('click', () => {
            document.getElementById("captionTag").value = tag;
        });
        return li;
    });

    document.getElementById('taglist').replaceChildren(...tagListItems);

    const tagCheckBoxes = tagArray.map(tag => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.classList.add('option-input');
        setAttributes(input, { type: 'checkbox', name: 'options', value: tag, checked: true });

        label.appendChild(input);
        label.appendChild(document.createTextNode(tag));
        return label;
    });

    document.getElementById('tagname').replaceChildren(...tagCheckBoxes);

    // TODO: show tag checkboxes
}

function setAttributes(e, attrs){
    for(const key in attrs){
        e.setAttribute(key, attrs[key]);
    }
}

// ----------------------------------------------------------------------------
// CSV data download
// ----------------------------------------------------------------------------

function handleDownload() {
    const content = json2csv(a);
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([ bom, content ], { "type" : "text/csv" });

    if (window.navigator.msSaveBlob) {
       window.navigator.msSaveBlob(blob, "test.csv");
       window.navigator.msSaveOrOpenBlob(blob, "test.csv");
    } else {
       document.getElementById("download").href = window.URL.createObjectURL(blob);
    }
}

function json2csv(json) {
   var header = Object.keys(json[0]).join(',') + "\n";

   var body = json.map(function(d){
       return Object.keys(d).map(function(key) {
           return d[key];
       }).join(',');
   }).join("\n");

   return header + body;
}
