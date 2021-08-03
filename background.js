chrome.runtime.onInstalled.addListener(() => {
    chrome.action.disable();

    chrome.declarativeContent.onPageChanged.removeRules(undefined, addRule);
});

function addRule() {
    const rule = {
        conditions: [
            new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { urlContains: 'youtube.com' },
            })
        ],
        actions: [new chrome.declarativeContent.ShowAction()],
    };

    chrome.declarativeContent.onPageChanged.addRules([rule]);
}
