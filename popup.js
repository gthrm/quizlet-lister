document.addEventListener('DOMContentLoaded', function () {
    const wordListElement = document.getElementById('wordList');
    const copyButton = document.getElementById('copyButton');
    const clearButton = document.getElementById('clearButton');
    const closeButton = document.getElementById('button-close');
    const copyNotification = document.getElementById('copy-notification');
    // Close popup on clicking the close button
    closeButton.addEventListener('click', function () {
        window.close();
    });

    // Load and display the words
    chrome.storage.sync.get({ words: [] }, (result) => {
        updateWordList(result.words);
    });

    // Copy all words to clipboard as comma-separated list with definitions
    copyButton.addEventListener('click', () => {
        let words = [];
        document.querySelectorAll('.word').forEach(wordElement => {
            words.push(`${wordElement.textContent}:Add definition here`);
        });
        let wordsString = words.join(', ');
        navigator.clipboard.writeText(wordsString).then(() => {
            copyNotification.style.opacity = '1';
            setTimeout(() => { copyNotification.style.opacity = '0'; }, 3000)
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
        words.forEach((element, index) => {
            const newWord = document.createElement('span');
            newWord.className = 'word';
            newWord.innerText = element;

            const newDeleteButton = document.createElement('button');
            newDeleteButton.innerText = 'X';
            newDeleteButton.className = 'close-button';
            newDeleteButton.onclick = function () {
                deleteWord(index);
            };

            const newLi = document.createElement('li');
            newLi.className = 'word-list-item';
            newLi.appendChild(newWord);
            newLi.appendChild(newDeleteButton);

            wordListElement.appendChild(newLi);
        });
    }

    // Function to delete a word
    function deleteWord(index) {
        chrome.storage.sync.get({ words: [] }, (result) => {
            let updatedWords = result.words.filter((_, wordIndex) => wordIndex !== index);
            chrome.storage.sync.set({ words: updatedWords }, () => {
                updateWordList(updatedWords);
            });
        });
    }

    const tooltipElement = document.getElementById('tooltip');
    const descriptionElement = document.getElementById('description');

    tooltipElement.addEventListener('mouseover', function () {
        descriptionElement.style.display = 'block';
    });

    tooltipElement.addEventListener('mouseout', function () {
        setTimeout(() => { descriptionElement.style.display = 'none'; }, 1000)
    });
});
