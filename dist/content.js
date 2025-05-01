"use strict";
// Create a container for the toast notifications
const toastContainer = document.createElement('div');
toastContainer.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
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
      background-color: #fff;
      border-left: 4px solid #4285f4;
      border-radius: 4px;
      padding: 16px;
      margin-top: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 350px;
      max-height: 300px;
      overflow-y: auto;
      word-wrap: break-word;
      transition: all 0.3s ease-in-out;
      opacity: 0;
      transform: translateX(100%);
      pointer-events: auto;
    `;
    // Add a header with the SmileyAI icon and title
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      color: #4285f4;
      font-weight: bold;
      font-family: Arial, sans-serif;
    `;
    // Create SVG icon instead of using image
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 128 128");
    svg.style.marginRight = "8px";
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "64");
    circle.setAttribute("cy", "64");
    circle.setAttribute("r", "60");
    circle.setAttribute("fill", "#FFDE00");
    circle.setAttribute("stroke", "#4285f4");
    circle.setAttribute("stroke-width", "4");
    svg.appendChild(circle);
    header.appendChild(svg);
    header.appendChild(document.createTextNode('SmileyAI Answer'));
    toast.appendChild(header);
    // Format the message with some basic markdown-like processing
    const messageDiv = document.createElement('div');
    // Convert plain text to HTML with paragraph breaks and basic formatting
    const formattedMessage = message
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    messageDiv.innerHTML = `<p>${formattedMessage}</p>`;
    messageDiv.style.cssText = `
      color: #333;
      font-size: 14px;
      line-height: 1.4;
      font-family: Arial, sans-serif;
    `;
    toast.appendChild(messageDiv);
    // Add close button
    const closeButton = document.createElement('div');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      color: #999;
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    `;
    toast.appendChild(closeButton);
    // Add hover effect
    toast.addEventListener('mouseenter', () => {
        toast.style.transform = 'translateX(0) scale(1.02)';
        toast.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
        // Stop auto-dismiss when user is hovering
        if (toast.autoDismissTimeout) {
            clearTimeout(toast.autoDismissTimeout);
            toast.autoDismissTimeout = undefined;
        }
    });
    toast.addEventListener('mouseleave', () => {
        toast.style.transform = 'translateX(0) scale(1)';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        // Resume auto-dismiss when mouse leaves
        startAutoDismissTimer(toast);
    });
    // Handle close button click
    closeButton.addEventListener('click', () => {
        dismissToast(toast);
    });
    toastContainer.appendChild(toast);
    // Trigger the entrance animation
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });
    // Start auto-dismiss timer
    startAutoDismissTimer(toast);
}
function startAutoDismissTimer(toast) {
    // Auto-remove the toast after 4 seconds
    toast.autoDismissTimeout = setTimeout(() => {
        dismissToast(toast);
    }, 4000);
}
function dismissToast(toast) {
    // Clear any existing timeout
    if (toast.autoDismissTimeout) {
        clearTimeout(toast.autoDismissTimeout);
        toast.autoDismissTimeout = undefined;
    }
    // Start dismiss animation
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    // Remove from DOM after animation completes
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}
//# sourceMappingURL=content.js.map