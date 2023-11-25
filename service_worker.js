/* eslint-disable no-undef */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'addToQuizlet',
    title: 'Add to Quizlet List',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'addToQuizlet' && info.selectionText) {
    // Store the selected word in Chrome's storage
    chrome.storage.sync.get({ words: [] }, (result) => {
      const updatedWords = [...result.words, info.selectionText];
      chrome.storage.sync.set({ words: updatedWords });
    });
  }
});
