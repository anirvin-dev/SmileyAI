document.addEventListener('DOMContentLoaded', function() {
  const takeScreenshotButton = document.getElementById('take-screenshot');
  const smiley = document.getElementById('smiley');
  const eyes = document.querySelectorAll('#left-eye, #right-eye');
  const closedEyes = document.getElementById('closed-eyes');
  const status = document.getElementById('status');
  
  // Initialize smiley state
  let isBlinking = false;
  let isHungry = false;
  
  // Take screenshot button click handler
  takeScreenshotButton.addEventListener('click', function() {
    if (isBlinking) return; // Prevent multiple clicks during animation
    
    // Blink animation
    blinkEyes().then(() => {
      // Take the screenshot
      chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataUrl) {
        if (chrome.runtime.lastError) {
          status.textContent = 'Error: ' + chrome.runtime.lastError.message;
          return;
        }
        
        // Store the screenshot
        chrome.storage.local.set({latestScreenshot: dataUrl}, function() {
          status.textContent = 'Screenshot taken! Analyzing...';
          
          // Send to background script for processing
          chrome.runtime.sendMessage({
            action: "analyzeScreenshot",
            screenshot: dataUrl
          }, function(response) {
            if (response && response.success) {
              status.textContent = 'Analysis complete!';
              // Show toast notification with results
              chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  action: "showToast",
                  message: response.analysis
                });
              });
            } else {
              status.textContent = 'Analysis failed. Please try again.';
            }
          });
        });
      });
    });
  });
  
  // Blink animation function
  function blinkEyes() {
    return new Promise((resolve) => {
      isBlinking = true;
      
      // Hide open eyes
      eyes.forEach(eye => eye.style.opacity = '0');
      
      // Show closed eyes
      closedEyes.style.opacity = '1';
      
      // After 300ms, reverse
      setTimeout(() => {
        eyes.forEach(eye => eye.style.opacity = '1');
        closedEyes.style.opacity = '0';
        isBlinking = false;
        resolve();
      }, 300);
    });
  }
  
  // Random blinking for idle animation
  setInterval(() => {
    if (!isBlinking && Math.random() < 0.3) { // 30% chance to blink every interval
      blinkEyes();
    }
  }, 3000);
  
  // Random interactions
  setInterval(() => {
    if (!isBlinking && Math.random() < 0.1) { // 10% chance for random interaction
      const interactions = [
        () => {
          status.textContent = "I'm feeling hungry...";
          isHungry = true;
        },
        () => {
          status.textContent = "What are you working on?";
        },
        () => {
          status.textContent = "Need help with anything?";
        }
      ];
      
      const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)];
      randomInteraction();
      
      // Clear status after 3 seconds
      setTimeout(() => {
        status.textContent = '';
      }, 3000);
    }
  }, 10000); // Check every 10 seconds
});
