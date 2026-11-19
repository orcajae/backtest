/* Sample charts: readouts for dots and markers, crosshair for the daily line charts.
   Everything the charts say is already in the static HTML; this only adds hover, tap and keyboard reading. */
(function () {
  if (/[?&]print\b/.test(location.search)) { document.querySelectorAll("details").forEach(function (d) { d.open = true; }); }
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function fmtDate(s) { var p = s.split("-"); return +p[2] + " " + MON[+p[1] - 1] + " " + p[0]; }
  function readoutFor(el) {
    var box = el.closest("figure, section, .card, div.two > div");
    var r = box && box.querySelector(".readout");
    if (!r) { r = document.querySelector(".readout"); }
    return r;
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-read]"); if (!b) return;
    var r = readoutFor(b); if (r) r.textContent = b.getAttribute("data-read");
    if (b.classList.contains("zc__ev")) {   // signal/fill list under the zoom chart: one chosen event, marked on the chart
      var fig = b.closest("figure");
      fig.querySelectorAll(".zc__ev").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      fig.querySelectorAll(".zc__sig, .zc__fill").forEach(function (m) { m.classList.toggle("is-on", m.getAttribute("data-ev") === b.getAttribute("data-ev")); });
    }
  });
  // tables wider than their box get a "scroll sideways" hint (the hint is in the HTML, hidden until needed)
  function hints() {
    document.querySelectorAll(".scroll").forEach(function (s) { s.classList.toggle("is-scrollable", s.scrollWidth > s.clientWidth + 1); });
  }
  hints(); window.addEventListener("resize", hints);
  document.addEventListener("focusin", function (e) {
    var b = e.target.closest && e.target.closest("[data-read]"); if (!b) return;
    var r = readoutFor(b); if (r) r.textContent = b.getAttribute("data-read");
  });
  var figs = document.querySelectorAll('figure[data-chart="line"]');
  if (!figs.length || !window.fetch) return;
  fetch("sample-data.json").then(function (r) { return r.json(); }).then(function (D) {
    var n = D.date.length;
    figs.forEach(function (fig) {
      var plot = fig.querySelector(".lc__plot"), cross = fig.querySelector(".lc__cross"), out = fig.querySelector(".readout");
      var id = fig.id, idx = n - 1;
      function text(i) {
        if (id === "equity") return fmtDate(D.date[i]) + " · Your rule $" + D.eq_rule[i].toFixed(2) + " · Buy and hold $" + D.eq_hold[i].toFixed(2);
        var v = id === "dd-rule" ? D.dd_rule[i] : D.dd_hold[i];
        return fmtDate(D.date[i]) + " · " + (v === 0 ? "at a peak" : "−" + Math.abs(v * 100).toFixed(1) + "% below the previous peak");
      }
      function show(i) {
        idx = Math.max(0, Math.min(n - 1, i));
        cross.hidden = false; cross.style.left = (idx / (n - 1) * 100) + "%";
        out.textContent = text(idx);
      }
      function fromEvent(e) { var b = plot.getBoundingClientRect(); return Math.round((e.clientX - b.left) / b.width * (n - 1)); }
      plot.addEventListener("pointermove", function (e) { show(fromEvent(e)); });
      plot.addEventListener("pointerdown", function (e) { show(fromEvent(e)); });
      plot.addEventListener("keydown", function (e) {
        var step = e.shiftKey ? 252 : 21;
        if (e.key === "ArrowRight") { show(idx + step); e.preventDefault(); }
        if (e.key === "ArrowLeft") { show(idx - step); e.preventDefault(); }
      });
      plot.addEventListener("focus", function () { show(idx); });
    });
  }).catch(function () {});
  window.addEventListener("beforeprint", function () { document.querySelectorAll("details").forEach(function (d) { d.open = true; }); });
})();
