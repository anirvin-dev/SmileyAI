"use strict";
const apiKeyInput = document.getElementById('apiKey');
const saveButton = document.getElementById('saveButton');
const statusDiv = document.getElementById('status');
chrome.storage.sync.get(['openaiApiKey'], (result) => {
    if (result.openaiApiKey) {
        apiKeyInput.value = result.openaiApiKey;
    }
});
saveButton.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
        chrome.storage.sync.set({ openaiApiKey: key }, () => {
            if (chrome.runtime.lastError) {
                statusDiv.textContent = 'Error saving key: ' + chrome.runtime.lastError.message;
                statusDiv.style.color = 'red';
            }
            else {
                statusDiv.textContent = 'API Key saved successfully!';
                statusDiv.style.color = 'green';
                setTimeout(() => { statusDiv.textContent = ''; }, 3000);
            }
        });
    }
    else {
        statusDiv.textContent = 'Please enter an API Key.';
        statusDiv.style.color = 'red';
    }
});
//# sourceMappingURL=options.js.map