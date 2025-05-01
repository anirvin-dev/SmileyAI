document.addEventListener('DOMContentLoaded', function() {
  const takeScreenshotButton = document.getElementById('take-screenshot');
  const smiley = document.getElementById('smiley');
  const eyes = document.querySelectorAll('#left-eye, #right-eye');
  const closedEyes = document.getElementById('closed-eyes');
  const status = document.getElementById('status');
  const progressBar = document.getElementById('progress-bar');
  const toastContainer = document.getElementById('toast-container');
  
  // Initialize smiley state
  let isAnimating = false;
  let isHungry = false;
  let currentAnimationTimeout: number | null = null;
  
  // Toast notification system
  function showToast(options: {
    title?: string;
    message: string;
    type?: string;
    duration?: number;
    image?: string | null;
  }): void {
    const {
      title = 'Notification',
      message,
      type = 'info',
      duration = 3000,
      image = null
    } = options;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Create toast content
    let imageHtml = '';
    if (image) {
      imageHtml = `
        <div class="toast-image-container">
          <img src="${image}" class="toast-image" alt="Screenshot">
        </div>
      `;
    }
    
    toast.innerHTML = `
      <div class="toast-header">
        <h3 class="toast-title">${title}</h3>
        <button class="toast-close">&times;</button>
      </div>
      <p class="toast-message">${message}</p>
      ${imageHtml}
    `;
    
    // Add to container
    toastContainer?.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Handle close button
    const closeButton = toast.querySelector('.toast-close');
    closeButton?.addEventListener('click', () => {
      hideToast(toast);
    });
    
    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => hideToast(toast), duration);
    }
  }
  
  function hideToast(toast: HTMLElement): void {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300); // Match the transition duration
  }
  
  function updateStatus(message: string, isActive = false): void {
    if (status) {
      status.textContent = message;
      status.className = isActive ? 'status-active' : '';
    }
  }
  
  function resetSmiley(): void {
    // Clear any pending timeouts
    if (currentAnimationTimeout) {
      clearTimeout(currentAnimationTimeout);
      currentAnimationTimeout = null;
    }
    
    // Remove all animation classes
    smiley?.classList.remove('jump', 'rolling');
    // Reset position and transform
    if (smiley) {
      smiley.style.right = '10px';
      smiley.style.transform = 'rotate(0deg)';
    }
    // Reset eyes
    eyes.forEach(eye => (eye as HTMLElement).style.opacity = '1');
    if (closedEyes) {
      closedEyes.style.opacity = '0';
    }
    // Reset progress bar
    if (progressBar) {
      progressBar.style.width = '0%';
    }
    // Reset animation state
    isAnimating = false;
  }
  
  function animateSmiley(): Promise<void> {
    return new Promise((resolve) => {
      isAnimating = true;
      
      // Reset smiley state before starting new animation
      resetSmiley();
      
      // First jump and blink
      smiley?.classList.add('jump');
      
      // Hide open eyes
      eyes.forEach(eye => (eye as HTMLElement).style.opacity = '0');
      if (closedEyes) {
        closedEyes.style.opacity = '1';
      }
      
      // After jump, start rolling
      currentAnimationTimeout = window.setTimeout(() => {
        smiley?.classList.remove('jump');
        eyes.forEach(eye => (eye as HTMLElement).style.opacity = '1');
        if (closedEyes) {
          closedEyes.style.opacity = '0';
        }
        
        // Start rolling animation
        smiley?.classList.add('rolling');
        
        // Update progress bar in chunks
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 1;
          if (progressBar) {
            progressBar.style.width = `${progress}%`;
          }
          
          if (progress >= 100) {
            clearInterval(progressInterval);
            
            // Stop rolling and reset position
            resetSmiley();
            
            currentAnimationTimeout = window.setTimeout(() => {
              isAnimating = false;
              resolve();
            }, 300);
          }
        }, 50); // Adjusted to match 2.5s animation (100 steps * 50ms = 5000ms for two full cycles)
      }, 500); // Match the jump animation duration
    });
  }
  
  // Take screenshot button click handler
  takeScreenshotButton?.addEventListener('click', async function() {
    if (isAnimating) return; // Prevent multiple clicks during animation
    
    try {
      // Start animation and take screenshot
      updateStatus('Taking screenshot...', true);
      await animateSmiley();
      
      // Take the screenshot
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      if (!tab?.id) {
        throw new Error('No active tab found');
      }
      
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {format: 'png' as const});
      
      // Show processing toast
      showToast({
        title: 'Processing...',
        message: 'Analyzing your screen with AI...',
        type: 'info',
        duration: 0, // Don't auto-dismiss while processing
      });
      
      // Send screenshot for AI analysis
      chrome.runtime.sendMessage(
        {
          action: "analyzeScreenshot",
          screenshot: dataUrl
        },
        async function(response) {
          // Hide processing toast
          const toasts = document.querySelectorAll('.toast');
          toasts.forEach(toast => hideToast(toast as HTMLElement));
          
          if (response && response.success) {
            // Show the analysis result
            showToast({
              title: 'Analysis Complete',
              message: response.analysis,
              type: 'success',
              duration: 10000
            });
            
            updateStatus('Analysis complete!', true);
          } else {
            showToast({
              title: 'Analysis Failed',
              message: response?.error || 'Failed to analyze screenshot',
              type: 'error',
              duration: 5000
            });
            updateStatus('Analysis failed.', false);
          }
          
          resetSmiley();
        }
      );
      
    } catch (error) {
      updateStatus('Error: ' + (error as Error).message);
      showToast({
        title: 'Error',
        message: 'Failed to capture screenshot. Please try again.',
        type: 'error',
        duration: 5000
      });
      resetSmiley();
    }
  });
  
  // Random blinking for idle animation
  setInterval(() => {
    if (!isAnimating && Math.random() < 0.3) { // 30% chance to blink every interval
      eyes.forEach(eye => (eye as HTMLElement).style.opacity = '0');
      if (closedEyes) {
        closedEyes.style.opacity = '1';
      }
      
      setTimeout(() => {
        eyes.forEach(eye => (eye as HTMLElement).style.opacity = '1');
        if (closedEyes) {
          closedEyes.style.opacity = '0';
        }
      }, 300);
    }
  }, 3000);
  
  // Random interactions
  setInterval(() => {
    if (!isAnimating && Math.random() < 0.1) { // 10% chance for random interaction
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
  }, 10000);
}); 