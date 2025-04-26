// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "analyzeScreenshot") {
        analyzeScreenshotWithAI(request.screenshot)
          .then(analysis => {
            sendResponse({
              success: true,
              analysis: analysis
            });
          })
          .catch(error => {
            console.error("AI analysis error:", error);
            sendResponse({
              success: false,
              error: error.message || "Failed to analyze screenshot"
            });
          });
        
        // Return true to indicate we'll respond asynchronously
        return true;
      }
});

async function analyzeScreenshotWithAI(screenshotDataUrl) {
    try {
      // Convert data URL to blob for upload
      const response = await fetch(screenshotDataUrl);
      const blob = await response.blob();
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append('image', blob, 'screenshot.png');
      
      // You'll need to replace this URL with your actual AI API endpoint
      const aiApiUrl = 'https://api.your-ai-service.com/analyze'; 
      
      // Set your API key in the headers (replace with your actual API key)
      const apiKey = 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;
      
      // Make the API request
      const aiResponse = await fetch(aiApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          // Don't set Content-Type with FormData, the browser will set it with boundary
        },
        body: formData
      });
      
      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiResponse.status} ${aiResponse.statusText}`);
      }
      
      const result = await aiResponse.json();
      
      // Return the AI analysis
      return result.analysis || "No analysis available";
      
    } catch (error) {
      console.error("Error analyzing screenshot:", error);
      throw error;
    }
  }
  
  // FOR TESTING: If you don't have an API key yet, you can use this mock function instead
  // Just rename this to analyzeScreenshotWithAI and comment out the real one above
  async function mockAnalyzeScreenshotWithAI(screenshotDataUrl) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For testing, return a mock response
    return "Based on the screenshot, I can see you're looking at a webpage. Here's what I found: This appears to be information about web development or programming. If you have specific questions about the content, feel free to take another screenshot with your question in focus.";
  }

// Keep the service worker alive
chrome.runtime.onInstalled.addListener(() => {
  console.log('SmileyAI extension installed');
});

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener(() => {
  chrome.runtime.reload();
});
