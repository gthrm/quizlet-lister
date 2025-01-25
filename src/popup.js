/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
document.addEventListener("DOMContentLoaded", () => {
  const languages = [
    "Russian",
    "English",
    "Afrikaans",
    "Albanian",
    "Amharic",
    "Arabic",
    "Armenian",
    "Bengali",
    "Bosnian",
    "Bulgarian",
    "Cantonese",
    "Croatian",
    "Czech",
    "Danish",
    "Dutch",
    "English",
    "Estonian",
    "Finnish",
    "French",
    "Georgian",
    "German",
    "Greek",
    "Gujarati",
    "Hausa",
    "Hebrew",
    "Hindi",
    "Hungarian",
    "Icelandic",
    "Irish",
    "Italian",
    "Japanese",
    "Kazakh",
    "Korean",
    "Kyrgyz",
    "Latvian",
    "Lithuanian",
    "Macedonian",
    "Malay",
    "Mandarin Chinese",
    "Marathi",
    "Mongolian",
    "Norwegian",
    "Pashto",
    "Persian (Farsi)",
    "Polish",
    "Portuguese",
    "Punjabi",
    "Romanian",
    ,
    "Serbian",
    "Slovak",
    "Somali",
    "Spanish",
    "Swahili",
    "Swedish",
    "Tamil",
    "Telugu",
    "Thai",
    "Turkish",
    "Turkmen",
    "Ukrainian",
    "Urdu",
    "Uzbek",
    "Vietnamese",
    "Welsh",
    "Xhosa",
    "Zulu",
  ];

  const wordListElement = document.getElementById("wordList");

  const copyButton = document.getElementById("copyButton");
  const clearButton = document.getElementById("clearButton");
  const closeButton = document.getElementById("button-close");
  const showHideTokenButton = document.getElementById("showHideTokenButton");
  const saveTokenButton = document.getElementById("saveToken");

  const select = document.getElementById("language-selector");

  const loadingSpinner = document.getElementById("loading");

  const copyNotification = document.getElementById("copy-notification");
  const errorNotification = document.getElementById("error-notification");

  createLanguageSelector();

  // Close popup on clicking the close button
  closeButton.addEventListener("click", () => {
    window.close();
  });

  // Load and display the words
  chrome.storage.sync.get({ words: [] }, (result) => {
    updateWordList(result.words);
    if (result.words.length === 0) {
      copyButton.disabled = true;
    } else {
      copyButton.disabled = false;
    }
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && changes.words) {
      updateWordList(changes.words.newValue);
      if (changes.words.newValue.length === 0) {
        copyButton.disabled = true;
      } else {
        copyButton.disabled = false;
      }
    }

    if (namespace === "local" && changes.language) {
      updateLanguageSelector();
    }
  });

  showHideTokenButton.addEventListener("click", () => {
    showHideTokenInput();
  });

  saveTokenButton.addEventListener("click", () => {
    const gptToken = document.getElementById("gptToken").value;

    if (!gptToken) {
      return;
    }

    chrome.storage.local.set({ gptToken }, () => {
      showHideTokenInput();
    });
  });

  // Copy all words to clipboard as comma-separated list with definitions
  copyButton.addEventListener("click", async () => {
    try {
      const result = await new Promise((resolve, reject) => {
        chrome.storage.sync.get({ words: [] }, (data) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(data);
          }
        });
      });

      const words = result.words.map((word) => `${word},Add definition here`);
      const wordsString = words.join("; ");

      copyButton.disabled = true;
      clearButton.disabled = true;
      closeButton.disabled = true;
      showHideTokenButton.disabled = true;
      saveTokenButton.disabled = true;
      loadingSpinner.style.display = "block";

      const translatedString = await translateAndFormat(wordsString);
      await navigator.clipboard.writeText(translatedString);

      copyButton.disabled = false;
      clearButton.disabled = false;
      closeButton.disabled = false;
      showHideTokenButton.disabled = false;
      saveTokenButton.disabled = false;
      loadingSpinner.style.display = "none";

      copyNotification.style.opacity = "1";

      setTimeout(() => {
        copyNotification.style.opacity = "0";
      }, 3000);
    } catch (error) {
      console.error("Error during copy operation:", error);
    }
  });

  // Clear the word list
  clearButton.addEventListener("click", () => {
    chrome.storage.sync.set({ words: [] }, () => {
      updateWordList([]);
    });
  });

  // Function to update the display of words
  function updateWordList(words) {
    wordListElement.innerHTML = "";
    words.forEach((element, index) => {
      const newWord = document.createElement("span");
      newWord.className = "word";
      newWord.innerText = element;

      const newDeleteButton = document.createElement("button");
      newDeleteButton.innerText = "X";
      newDeleteButton.className = "close-button";
      newDeleteButton.onclick = function () {
        deleteWord(index);
      };

      const newLi = document.createElement("li");
      newLi.className = "word-list-item";
      newLi.appendChild(newWord);
      newLi.appendChild(newDeleteButton);

      wordListElement.appendChild(newLi);
    });
  }

  // Function to delete a word
  function deleteWord(index) {
    chrome.storage.sync.get({ words: [] }, (result) => {
      const updatedWords = result.words.filter(
        (_, wordIndex) => wordIndex !== index
      );
      chrome.storage.sync.set({ words: updatedWords }, () => {
        updateWordList(updatedWords);
      });
    });
  }

  // Helper function to translate a word or phrase and return a processed result
  async function translateAndFormat(phrase) {
    let formattedResult = phrase;
    try {
      const { gptToken } = await chrome.storage.local.get("gptToken");
      const { language } = await chrome.storage.local.get("language");

      if (gptToken) {
        // Use GPT API to translate the entire string at once

        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${gptToken}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: `You are translating a string to ${language} containing word-definition pairs used in web extensions. Each pair is formatted as 'word,Add definition here' and pairs are separated by semicolons. Replace 'Add definition here' with a proper translation while keeping the format and structure unchanged. For example: 'word,Translated definition; another word,Translated definition'. Keep it concise and context-appropriate.`,
                },
                {
                  role: "user",
                  content: phrase,
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message);
        }
        const data = await response.json();

        formattedResult = data.choices[0].message.content.trim();
      } else {
        // Default local formatting (no translation)
        formattedResult = phrase;
      }
    } catch (error) {
      errorNotification.style.display = "block";
      errorNotification.innerText = "Error: " + error.message;

      setTimeout(() => {
        errorNotification.style.display = "none";
      }, 3000);
    }

    return formattedResult;
  }

  function showHideTokenInput() {
    const tokenContainer = document.getElementById("gpt-container");

    if (tokenContainer.style.display !== "block") {
      showHideTokenButton.innerText = "Hide AI Settings";
      tokenContainer.style.display = "block";
    } else {
      showHideTokenButton.innerText = "AI Translation Settings";
      tokenContainer.style.display = "none";
    }
  }

  async function updateLanguageSelector() {
    const { language: selectedLanguage } = await chrome.storage.local.get(
      "language"
    );

    select.value = selectedLanguage || languages[0];
  }

  async function createLanguageSelector() {
    languages.forEach((language) => {
      const option = document.createElement("option");
      option.value = language;
      option.textContent = language;
      select.appendChild(option);
    });

    await updateLanguageSelector();

    select.addEventListener("change", async (event) => {
      const selectedValue = event.target.value;
      await chrome.storage.local.set({ language: selectedValue });
    });
  }

  const tooltipElement = document.getElementById("tooltip");
  const descriptionElement = document.getElementById("description");

  tooltipElement.addEventListener("mouseover", () => {
    descriptionElement.style.display = "block";
  });

  tooltipElement.addEventListener("mouseout", () => {
    setTimeout(() => {
      descriptionElement.style.display = "none";
    }, 3000);
  });
});
