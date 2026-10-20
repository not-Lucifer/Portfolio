// Boots a self-hosted Unity Web build inside /games/<id>/. Config comes from data- attributes.
(() => {
  "use strict";
  const root = document.querySelector("[data-game-frame]");
  if (!root) return;
  const d = root.dataset;
  const canvas = root.querySelector("canvas");
  const bar = root.querySelector(".gf-bar span");
  const status = root.querySelector(".gf-status");

  const fail = (text) => {
    root.classList.add("is-error");
    status.textContent = text;
  };

  if (!("WebGL2RenderingContext" in window)) {
    fail("This browser doesn't support WebGL 2, which the game needs. Try a recent Chrome, Edge or Firefox.");
    return;
  }

  const script = document.createElement("script");
  script.src = d.loader;
  script.onerror = () => fail("The game files didn't load. Check your connection and reload.");
  script.onload = () => {
    window
      .createUnityInstance(
        canvas,
        {
          dataUrl: d.data,
          frameworkUrl: d.framework,
          codeUrl: d.code,
          companyName: d.company,
          productName: d.product,
          productVersion: d.version,
          // Cap the render resolution: big screens stay smooth, the game still looks sharp.
          devicePixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
        },
        (p) => {
          bar.style.transform = `scaleX(${p})`;
          status.textContent = `Loading ${Math.round(p * 100)}%`;
        }
      )
      .then(() => {
        root.classList.add("is-ready");
        canvas.focus();
      })
      .catch((err) => fail(`The game couldn't start: ${err}`));
  };
  document.body.append(script);

  // Clicking the game gives it the keyboard.
  canvas.addEventListener("pointerdown", () => canvas.focus());
})();
