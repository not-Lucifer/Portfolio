// Opens a hackathon tile's <dialog>; clicking the backdrop closes it. Without JS the tiles simply don't open.
for (const btn of document.querySelectorAll("[data-open]")) {
  btn.addEventListener("click", () => document.getElementById(btn.dataset.open)?.showModal());
}
for (const d of document.querySelectorAll("dialog.hk-dialog")) {
  d.addEventListener("click", (e) => {
    const r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
  });
}
