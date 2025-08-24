(function() {
  const currentScript = document.currentScript;
  const appName = currentScript.getAttribute("data-app-name") || "My App";
  const appSubtitle = currentScript.getAttribute("data-app-subtitle") || "Install for a better experience";
  const appLogo = currentScript.getAttribute("data-app-logo") || "/favicon.ico";

  // Inject styles
  const style = document.createElement("style");
  style.textContent = `
    .pwa-overlay { position: fixed; inset: 0; background: rgb(0 0 0 / 56%); z-index: 999999999; display: flex; align-items: flex-end; justify-content: center; transition: opacity 0.3s ease; }
    .pwa-overlay.hidden { opacity: 0; pointer-events: none; }
    .pwa-overlay.visible { opacity: 1; pointer-events: auto; }
    .pwa-prompt { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; box-shadow: 0 -2px 10px rgba(0,0,0,0.15); border-top-left-radius: 12px; border-top-right-radius: 12px; padding: 16px; font-family: sans-serif; z-index: 9999999999; transform: translateY(100%); transition: transform 0.3s ease-out; }
    .pwa-prompt.visible { transform: translateY(0%); }
    .pwa-prompt.hidden { transform: translateY(100%); }
    .pwa-title { font-weight: bold; font-size: 18px; margin-bottom: 12px; }
    .pwa-app-option { display: flex; align-items: center; justify-content: space-between; margin: 10px 0; }
    .pwa-app-name { display: flex; align-items: center; gap: 8px; font-size: 16px; }
    .pwa-app-name img { width: 24px; height: 24px; border-radius: 5px; }
    .pwa-app-labels { display: flex; flex-direction: column; line-height: 1.2; }
    .pwa-app-labels .name { font-weight: 600; font-size: 16px; color: #111; }
    .pwa-app-labels .subtitle { font-size: 12px; color: #666; margin-top: 2px; }
    .pwa-btn { border: none; padding: 6px 16px; border-radius: 6px; font-weight: bold; font-size: 14px; cursor: pointer; }
    .pwa-btn.red { background-color: #3f82f8; color: white; padding: 6px 29px !important; }
    .pwa-btn.gray { background-color: #f0f0f0; color: #333; }
    @media (min-width: 768px) { #pwa-prompt { max-width: 700px; margin: auto; } }
  `;
  document.head.appendChild(style);

  // Inject HTML
  const overlay = document.createElement("div");
  overlay.innerHTML = `
    <div id="pwa-overlay" class="pwa-overlay hidden" aria-hidden="true">
      <div id="pwa-prompt" class="pwa-prompt hidden" role="dialog" aria-modal="true">
        <div class="pwa-container">
          <p class="pwa-title">See this page in:</p>
          <div class="pwa-app-option">
            <div class="pwa-app-name">
              <img src="${appLogo}" alt="App Icon" />
              <div class="pwa-app-labels">
                <span class="name">${appName}</span>
                <span class="subtitle">${appSubtitle}</span>
              </div>
            </div>
            <button id="pwa-install-btn" class="pwa-btn red" aria-label="Install App">Open</button>
          </div>
          <div class="pwa-app-option">
            <div class="pwa-app-name">
              <img src="https://www.google.com/favicon.ico" alt="Browser Icon" />
              <span>Browser</span>
            </div>
            <button id="pwa-dismiss-btn" class="pwa-btn gray" aria-label="Continue in Browser">Continue</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // JS Logic
  let deferredPrompt = null;

  function showWidget() {
    document.getElementById("pwa-overlay").classList.replace("hidden", "visible");
    document.getElementById("pwa-prompt").classList.replace("hidden", "visible");
  }

  function hideWidget() {
    document.getElementById("pwa-overlay").classList.replace("visible", "hidden");
    document.getElementById("pwa-prompt").classList.replace("visible", "hidden");
  }

  function shouldShowPrompt() {
    return !sessionStorage.getItem("pwa-dismissed");
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    if (!shouldShowPrompt()) return;
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(showWidget, 2000);
  });

  document.getElementById("pwa-install-btn").addEventListener("click", async () => {
    if (deferredPrompt) {
      hideWidget();
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("User response:", outcome);
      deferredPrompt = null;
    }
  });

  document.getElementById("pwa-dismiss-btn").addEventListener("click", () => {
    sessionStorage.setItem("pwa-dismissed", "true");
    hideWidget();
  });
})();
