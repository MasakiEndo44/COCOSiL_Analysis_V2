/* COCOSiL V2 — Interactive HTML Doc 基底インタラクション
   interactive-html-doc-builder スキルの共通JS（タブ・アコーディオン制御）。
   出典: docs/output/help/scripts.js（TSK-DOCS-002 の正解実装）
   外部依存ゼロ。素のDOM APIで実装。 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initAccordions();
  });

  function initTabs() {
    var buttons = document.querySelectorAll('.tab-btn');
    var panels = document.querySelectorAll('.panel');
    if (buttons.length === 0 || panels.length === 0) return;

    function activate(targetId, opts) {
      opts = opts || {};
      var matched = false;
      buttons.forEach(function (btn) {
        var isActive = btn.getAttribute('data-target') === targetId;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
        if (isActive) matched = true;
      });
      panels.forEach(function (panel) {
        var isActive = panel.id === targetId;
        panel.classList.toggle('is-active', isActive);
        panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });
      if (matched && opts.updateHash !== false) {
        if (history.replaceState) {
          history.replaceState(null, '', '#' + targetId);
        } else {
          location.hash = targetId;
        }
      }
      if (matched && opts.scroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-target');
        if (target) activate(target, { scroll: true });
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var list = Array.prototype.slice.call(buttons);
        var idx = list.indexOf(btn);
        var nextIdx;
        if (e.key === 'ArrowRight') {
          nextIdx = (idx + 1) % list.length;
        } else {
          nextIdx = (idx - 1 + list.length) % list.length;
        }
        var nextBtn = list[nextIdx];
        nextBtn.focus();
        var nextTarget = nextBtn.getAttribute('data-target');
        if (nextTarget) activate(nextTarget);
      });
    });

    var initial = (location.hash || '').replace(/^#/, '');
    var validIds = Array.prototype.map.call(panels, function (p) {
      return p.id;
    });
    if (initial && validIds.indexOf(initial) !== -1) {
      activate(initial, { updateHash: false });
    } else {
      activate(panels[0].id, { updateHash: false });
    }

    window.addEventListener('hashchange', function () {
      var id = (location.hash || '').replace(/^#/, '');
      if (id && validIds.indexOf(id) !== -1) {
        activate(id, { updateHash: false });
      }
    });
  }

  function initAccordions() {
    var headers = document.querySelectorAll('.accordion-header');
    headers.forEach(function (header) {
      header.setAttribute('aria-expanded', 'false');
      header.addEventListener('click', function () {
        var wrap = header.parentElement;
        if (!wrap) return;
        var isOpen = wrap.classList.toggle('is-open');
        header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });
  }
})();
