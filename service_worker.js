chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "addToQuizlet",
        title: "Add to List",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "addToQuizlet" && info.selectionText) {
        // Store the selected word in Chrome's storage
        chrome.storage.sync.get({ words: [] }, (result) => {
            let updatedWords = [...result.words, info.selectionText];
            chrome.storage.sync.set({ words: updatedWords });
        });
    }
});
