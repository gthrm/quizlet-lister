document.addEventListener('DOMContentLoaded', function () {
    let wordListElement = document.getElementById('wordList');
    let copyButton = document.getElementById('copyButton');
    let clearButton = document.getElementById('clearButton'); // New clear button

    // Load and display the words
    chrome.storage.sync.get({ words: [] }, (result) => {
        updateWordList(result.words);
    });

    // Copy all words to clipboard as comma-separated list
    copyButton.addEventListener('click', () => {
        let words = [];
        document.querySelectorAll('.word').forEach(wordElement => {
            words.push(`${wordElement.textContent}:Add definition here`);
        });
        let wordsString = words.join(', ');
        navigator.clipboard.writeText(wordsString).then(() => {
            alert('Copied to clipboard');
        });
    });

    // Clear the word list
    clearButton.addEventListener('click', () => {
        chrome.storage.sync.set({ words: [] }, () => {
            updateWordList([]);
        });
    });

    // Function to update the display of words
    function updateWordList(words) {
        wordListElement.innerHTML = '';
        words.forEach(element => {
            const newWord = document.createElement('span');
            newWord.className = 'word';
            newWord.innerText = element;
            wordListElement.appendChild(newWord);
        });
    }
});
