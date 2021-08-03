console.log("ScrapTube running...");

let script = document.getElementById("injected-script");

if(!script){
    script = document.createElement("script");
    script.id = "injected-script";
    script.src = chrome.runtime.getURL("inject.js");
    document.body.appendChild(script);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(!sender.tab){ // message was from popup.js
        if(request.type == "info"){
            window.postMessage({ from: "content.js" }, "*");
            sendResponse({});    
        }
    }
});

window.addEventListener("message", (e) => {
    if(e.data.from == "inject.js"){
        console.log("message received at content.js from inject.js")
        chrome.runtime.sendMessage({ info: e.data.info }, (res) => {});
    }
})