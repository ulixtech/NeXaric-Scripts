/*
* pwa-widget.js - A self-contained PWA install prompt widget.
* To use, simply include this script on your webpage after defining the config:
* <script>
* window.pwaWidgetConfig = {
* appName: "My Cool App",
* appLogoUrl: "/images/my-app-logo.png"
* };
* </script>
* <script src="pwa-widget.js"></script>
*/

(function() {
  let deferredPrompt = null;

  // ---------------------------------------------
  // ⚙️ DEFAULT CONFIGURATION
  // ---------------------------------------------
  const defaultConfig = {
    appName: "Hoophaap App",
    appLogoUrl: "/favicons/android-chrome-192x192.png",
    browserIconUrl: "https://www.google.com/favicon.ico",
    appSubtitle: "35% faster on App"
  };

  // Merge default config with user-provided config
  const config = { ...defaultConfig, ...(window.pwaWidgetConfig || {}) };

  console.log("PWA Widget: Initializing with config:", config);

  // HTML content for the widget
  const widgetHTML = `
    <div id="pwa-overlay" class="pwa-overlay hidden" aria-hidden="true">
      <div id="pwa-prompt" class="pwa-prompt hidden" role="dialog" aria-modal="true">
        <div class="pwa-container">
          <p class="pwa-title">See this page in:</p>

          <div class="pwa-app-option">
            <div class="pwa-app-name">
              <img src="${config.appLogoUrl}" alt="App Icon" />
              <div class="pwa-app-labels">
                <span class="name">${config.appName}</span>
                <span class="subtitle">${config.appSubtitle}</span>
              </div>
            </div>
            <button id="pwa-install-btn" class="pwa-btn red" aria-label="Install App">Open</button>
          </div>

          <div class="pwa-app-option">
            <div class="pwa-app-name">
              <img src="${config.browserIconUrl}" alt="Browser Icon" />
              <span>Browser</span>
            </div>
            <button id="pwa-dismiss-btn" class="pwa-btn gray" aria-label="Continue in Browser">Continue</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // CSS styles for the widget (unchanged)
  const widgetCSS = `
    .pwa-overlay {
      position: fixed;
      inset: 0;
      background: rgb(0 0 0 / 56%);
      z-index: 999999999;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      transition: opacity 0.3s ease;
    }

    .pwa-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .pwa-overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .pwa-prompt {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #fff;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      padding: 16px;
      font-family: sans-serif;
      z-index: 9999999999;
      transform: translateY(100%);
      transition: transform 0.3s ease-out;
    }

    .pwa-app-labels {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .pwa-app-labels .name {
      font-weight: 600;
      font-size: 16px;
      color: #111;
    }

    .pwa-app-labels .subtitle {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }
    
    .pwa-prompt.visible {
      transform: translateY(0%);
    }

    .pwa-prompt.hidden {
      transform: translateY(100%);
    }

    .pwa-title {
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 12px;
    }

    .pwa-app-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 10px 0;
    }

    .pwa-app-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
    }

    .pwa-app-name img {
      width: 24px;
      height: 24px;
      border-radius: 5px;
    }

    .pwa-btn {
      border: none;
      padding: 6px 16px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
    }

    .pwa-btn.red {
      background-color: #3f82f8;
      color: white;
      padding: 6px 29px !important;
    }

    .pwa-btn.gray {
      background-color: #f0f0f0;
      color: #333;
    }

    @media (min-width: 768px) {
      div#pwa-prompt {
        max-width: 700px;
        margin: auto;
      }
    }
  `;

  // Function to show the widget
  function showWidget() {
    const overlay = document.getElementById("pwa-overlay");
    const prompt = document.getElementById("pwa-prompt");
    if (overlay && prompt) {
      overlay.classList.remove("hidden");
      overlay.classList.add("visible");
      prompt.classList.remove("hidden");
      prompt.classList.add("visible");
      console.log("PWA Widget: Showing the install prompt.");
    }
  }

  // Function to hide the widget
  function hideWidget() {
    const overlay = document.getElementById("pwa-overlay");
    const prompt = document.getElementById("pwa-prompt");
    if (overlay && prompt) {
      overlay.classList.remove("visible");
      overlay.classList.add("hidden");
      prompt.classList.remove("visible");
      prompt.classList.add("hidden");
      console.log("PWA Widget: Hiding the install prompt.");
    }
  }

  // Check if the prompt should be shown
  function shouldShowPrompt() {
    const dismissed = sessionStorage.getItem("pwa-dismissed");
    console.log(`PWA Widget: Check if dismissed. Status: ${dismissed ? 'Dismissed' : 'Not dismissed'}`);
    return !dismissed;
  }

  // Main function to initialize and add the widget to the DOM
  function initializePWAWidget() {
    console.log("PWA Widget: DOM ready, starting initialization.");
    
    // Inject CSS
    const styleElement = document.createElement('style');
    styleElement.innerHTML = widgetCSS;
    document.head.appendChild(styleElement);
    console.log("PWA Widget: CSS injected into the <head>.");

    // Inject HTML
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container.firstChild);
    console.log("PWA Widget: HTML injected into the <body>.");

    // Add event listeners
    const installBtn = document.getElementById("pwa-install-btn");
    const dismissBtn = document.getElementById("pwa-dismiss-btn");

    if (installBtn) {
      console.log("PWA Widget: 'Install App' button found, adding listener.");
      installBtn.addEventListener("click", async () => {
        console.log("PWA Widget: 'Install App' button clicked.");
        if (deferredPrompt) {
          console.log("PWA Widget: Hiding custom UI and prompting native install dialog.");
          const prompt = document.getElementById("pwa-prompt");
          const overlay = document.getElementById("pwa-overlay");
          if (prompt) prompt.style.display = "none";
          if (overlay) overlay.style.display = "none";
          
          deferredPrompt.prompt();

          const { outcome } = await deferredPrompt.userChoice;
          console.log("PWA Widget: User response to install prompt:", outcome);

          deferredPrompt = null;
          console.log("PWA Widget: Deferred prompt cleared.");
        }
      });
    }

    if (dismissBtn) {
      console.log("PWA Widget: 'Continue in Browser' button found, adding listener.");
      dismissBtn.addEventListener("click", () => {
        console.log("PWA Widget: 'Continue in Browser' button clicked. Dismissing widget.");
        sessionStorage.setItem("pwa-dismissed", "true");
        hideWidget();
      });
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log("PWA Widget: 'beforeinstallprompt' event fired.");
      if (!shouldShowPrompt()) {
        console.log("PWA Widget: Prompt already dismissed, not showing.");
        return;
      }

      e.preventDefault();
      deferredPrompt = e;
      console.log("PWA Widget: Deferred prompt saved. Waiting 2 seconds to show widget.");

      // Wait 2 seconds before showing the prompt
      setTimeout(showWidget, 2000);
    });

    console.log("PWA Widget: Event listeners for 'beforeinstallprompt' added.");
  }

  // Run the initialization function when the DOM is ready
  document.addEventListener("DOMContentLoaded", initializePWAWidget);

})();
