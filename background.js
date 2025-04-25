// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeScreenshot") {
    // Here you would send the screenshot to your AI model (like DeepSeek)
    // For now, we'll simulate the AI response
    simulateAIResponse(request.screenshot).then(response => {
      sendResponse({
        success: true,
        analysis: response
      });
    }).catch(error => {
      sendResponse({
        success: false,
        error: error.message
      });
    });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

// Simulate AI response (replace this with actual API call)
async function simulateAIResponse(screenshot) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For now, return a mock response
  return "This is a simulated AI response. In the future, this will contain actual analysis of the screenshot using an AI model like DeepSeek.";
}

// Keep the service worker alive
chrome.runtime.onInstalled.addListener(() => {
  console.log('SmileyAI extension installed');
});

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener(() => {
  chrome.runtime.reload();
});
