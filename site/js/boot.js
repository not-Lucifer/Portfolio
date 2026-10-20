// Runs before first paint. Turns on reveal states only when motion is welcome,
// and turns them back off if main.js never arrives, so content is never stuck hidden.
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  root.classList.add("motion");
  window.setTimeout(function () {
    if (!root.classList.contains("ready")) root.classList.remove("motion");
  }, 4000);
})();
