

const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
const saveButton = document.getElementById('saveButton') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

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
            } else {
                statusDiv.textContent = 'API Key saved successfully!';
                statusDiv.style.color = 'green';
                setTimeout(() => { statusDiv.textContent = ''; }, 3000);
            }
        });
    } else {
        statusDiv.textContent = 'Please enter an API Key.';
        statusDiv.style.color = 'red';
    }
});