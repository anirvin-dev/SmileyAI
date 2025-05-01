const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = "gpt-4o"; 

function showNotification(title: string, message: string, isError: boolean = false) {
    const notificationId = `screenshot-ai-${Date.now()}`;
    chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: 'icons/icon128.png', 
        title: title,
        message: message,
        priority: isError ? 2 : 0 
    });
}

async function getApiKey(): Promise<string | null> {
    try {
        const result = await chrome.storage.sync.get(['openaiApiKey']);
        return result.openaiApiKey || null;
    } catch (error) {
        console.error("Error getting API key from storage:", error);
        return null;
    }
}

async function analyzeScreenshot(apiKey: string, imageDataUrl: string): Promise<string> {
    const prompt = `Analyze the following screenshot.
1. Determine if it clearly presents a specific task, question (e.g., multiple choice, fill-in-the-blank, short answer), or instructions for an action (like solving a problem or completing an assignment).
2. If YES: Provide a direct answer to the question, perform the requested task based *only* on the information in the image, or offer clear guidance to complete the instructions shown. Do not refuse reasonable requests clearly depicted.
3. If NO (e.g., it's just a webpage, article, image without a direct question/task): Provide a concise summary of the main content or subject visible in the screenshot.

Begin your response directly with the answer, task completion, guidance, or summary. Do not include preamble like "Based on the screenshot..." unless necessary for clarity.`;

    try {
        console.log("Sending request to OpenAI...");
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageDataUrl,
                                    detail: "auto"
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 700
            })
        });

        console.log("Received response from OpenAI. Status:", response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("OpenAI API Error:", errorData);
            throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
             console.log("OpenAI Success:", data.choices[0].message.content);
             return data.choices[0].message.content.trim();
        } else {
            console.error("Invalid response structure from OpenAI:", data);
            throw new Error('Invalid response structure from OpenAI API.');
        }

    } catch (error: any) {
         console.error("Error during OpenAI API call:", error);
         throw new Error(`Failed to analyze image. ${error.message || 'Check API key and network.'}`);
    }
}

chrome.commands.onCommand.addListener(async (command) => {
    console.log(`Command received: ${command}`);
    if (command === "take_screenshot_analyze") {
        showNotification("Processing...", "Taking screenshot and contacting AI...", false);

        const apiKey = await getApiKey();
        if (!apiKey) {
            showNotification("Error: API Key Missing", "Please set your OpenAI API key in the extension options.", true);
            return;
        }

        let activeTab: chrome.tabs.Tab | null = null;
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs && tabs.length > 0 && tabs[0].id) {
                 activeTab = tabs[0];
                 console.log("Active tab found:", activeTab.id);
            } else {
                throw new Error("Could not find active tab.");
            }

            const imageDataUrl = await chrome.tabs.captureVisibleTab(activeTab.windowId, { format: 'png' });
            console.log("Screenshot captured.");

            if (!imageDataUrl) {
                 throw new Error("Failed to capture screenshot (returned empty).");
            }

            const analysisResult = await analyzeScreenshot(apiKey, imageDataUrl);

            showNotification("AI Analysis Complete", analysisResult, false);

        } catch (error: any) {
            console.error("Error in command handler:", error);
            showNotification("Error", error.message || "An unexpected error occurred.", true);
            if (error.message && error.message.toLowerCase().includes('screenshot') && activeTab?.url?.startsWith('chrome://')) {
                 showNotification("Error: Cannot Capture", "Cannot capture screenshots of internal Chrome pages (like chrome://extensions).", true);
            } else if (error.message && error.message.toLowerCase().includes('api key')) {
                 showNotification("Error: OpenAI Issue", "Please check your OpenAI API key and ensure it has vision capabilities and sufficient credits.", true);
            }
        }
    }
});

console.log("Screenshot Task AI background script loaded.");

chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
        console.log("Extension installed.");
    } else if (details.reason === 'update') {
        console.log("Extension updated to version:", chrome.runtime.getManifest().version);
    }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "analyzeScreenshot") {
    console.log("Received screenshot analysis request");
    
    try {
      const apiKey = await getApiKey();
      console.log("API key status:", apiKey ? "Found" : "Not found");
      
      if (!apiKey) {
        console.error("API key not found in storage");
        sendResponse({ success: false, error: "API key not found. Please set your OpenAI API key in the extension options." });
        return;
      }

      console.log("Starting screenshot analysis...");
      const analysisResult = await analyzeScreenshot(apiKey, message.screenshot);
      console.log("Analysis completed successfully");
      
      sendResponse({ success: true, analysis: analysisResult });
    } catch (error: any) {
      console.error("Error in analyzeScreenshot handler:", error);
      sendResponse({ 
        success: false, 
        error: error.message || "Failed to analyze screenshot. Please check your API key and try again." 
      });
    }
    return true;
  }
});