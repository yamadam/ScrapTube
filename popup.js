window.addEventListener("DOMContentLoaded", () => {
    requestInfo();
});

async function requestInfo(){
    const tab = await getCurrentTab();
    chrome.tabs.sendMessage(tab.id, { type: "info" }, (res) => { console.log(res); });
}

async function getCurrentTab(){
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(sender.tab){ // message was from content.js
        console.log("message from content.js to popup.js")
        showInfo(request.info);
        sendResponse({});
    }
});

function showInfo(info){
    // TODO: make popup.html more fancy
    document.getElementById("url").innerText = info.url;
    document.getElementById("duration").innerText = info.duration;
    document.getElementById("time").innerText = info.time;
}

document.getElementById("scrapButton").addEventListener("click", scrap);

function scrap(){
    // TODO: save things to storage
}