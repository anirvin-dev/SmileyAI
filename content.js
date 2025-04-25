// Create a container for the toast notifications
const toastContainer = document.createElement('div');
toastContainer.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
document.body.appendChild(toastContainer);

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showToast") {
    showToast(request.message);
  }
});

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 16px;
    margin-top: 10px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    max-width: 300px;
    word-wrap: break-word;
    transition: all 0.3s ease-in-out;
    opacity: 0;
    transform: translateY(20px);
  `;
  
  // Add a header with the SmileyAI icon
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    color: #333;
    font-weight: bold;
  `;
  
  const icon = document.createElement('img');
  icon.src = chrome.runtime.getURL('images/icon16.png');
  icon.style.cssText = `
    width: 16px;
    height: 16px;
    margin-right: 8px;
  `;
  
  header.appendChild(icon);
  header.appendChild(document.createTextNode('SmileyAI'));
  toast.appendChild(header);
  
  // Add the message
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    color: #666;
    font-size: 14px;
    line-height: 1.4;
  `;
  toast.appendChild(messageDiv);
  
  toastContainer.appendChild(toast);
  
  // Trigger the animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  
  // Remove the toast after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 5000);
}
