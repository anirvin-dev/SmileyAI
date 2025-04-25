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
    border-left: 4px solid #ff9800;
    border-radius: 4px;
    padding: 16px;
    margin-top: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 300px;
    word-wrap: break-word;
    transition: all 0.3s ease-in-out;
    opacity: 0;
    transform: translateX(100%);
    pointer-events: auto;
    cursor: pointer;
  `;
  
  // Add a header with the SmileyAI icon and title
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    color: #ff9800;
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
  circle.setAttribute("stroke", "#FF9800");
  circle.setAttribute("stroke-width", "4");
  
  svg.appendChild(circle);
  header.appendChild(svg);
  header.appendChild(document.createTextNode('SmileyAI Analysis'));
  toast.appendChild(header);
  
  // Add the message
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    color: #666;
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
  });
  
  toast.addEventListener('mouseleave', () => {
    toast.style.transform = 'translateX(0) scale(1)';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  });
  
  // Handle close button click
  closeButton.addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toastContainer.removeChild(toast), 300);
  });
  
  toastContainer.appendChild(toast);
  
  // Trigger the entrance animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });
  
  // Auto-remove the toast after 8 seconds
  setTimeout(() => {
    if (toast.parentNode === toastContainer) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode === toastContainer) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }
  }, 8000);
}
