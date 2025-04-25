document.addEventListener('DOMContentLoaded', function() {
  const takeScreenshotButton = document.getElementById('take-screenshot');
  const smiley = document.getElementById('smiley');
  const eyes = document.querySelectorAll('#left-eye, #right-eye');
  const closedEyes = document.getElementById('closed-eyes');
  const status = document.getElementById('status');
  
  // Initialize smiley state
  let isBlinking = false;
  let isHungry = false;
  
  function updateStatus(message, isActive = false) {
    status.textContent = message;
    status.className = isActive ? 'status-active' : '';
  }
  
  // Take screenshot button click handler
  takeScreenshotButton.addEventListener('click', async function() {
    if (isBlinking) return; // Prevent multiple clicks during animation
    
    // Blink animation
    await blinkEyes();
    
    try {
      // Take the screenshot
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      const dataUrl = await chrome.tabs.captureVisibleTab(null, {format: 'png'});
      
      updateStatus('Screenshot taken! Analyzing...', true);
      
      // Store the screenshot
      await chrome.storage.local.set({latestScreenshot: dataUrl});
      
      // Send to background script for processing
      chrome.runtime.sendMessage({
        action: "analyzeScreenshot",
        screenshot: dataUrl
      }, function(response) {
        if (response && response.success) {
          updateStatus('Analysis complete!', true);
          
          // Show toast notification with results
          chrome.tabs.sendMessage(tab.id, {
            action: "showToast",
            message: response.analysis
          });
        } else {
          updateStatus('Analysis failed. Please try again.');
        }
      });
    } catch (error) {
      updateStatus('Error: ' + error.message);
    }
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
          updateStatus("I'm feeling hungry...");
          isHungry = true;
        },
        () => {
          updateStatus("What are you working on?");
        },
        () => {
          updateStatus("Need help with anything?");
        }
      ];
      
      const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)];
      randomInteraction();
      
      // Clear status after 3 seconds
      setTimeout(() => {
        updateStatus('');
      }, 3000);
    }
  }, 10000); // Check every 10 seconds
});
