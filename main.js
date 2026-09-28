// ==========================================================================
// RESUME WEBSITE JAVASCRIPT
// Theme toggle, interactive tabs, brief builder, smooth navigation
// ==========================================================================

(function () {
  'use strict';

  var root = document.documentElement;
  var TG_USER = 'Eksailed'; // Default Telegram handle based on GitHub

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    ta.remove();
    return ok;
  }

  // ---------- THEME TOGGLE ----------
  var themeBtn = document.querySelector('[data-theme-toggle]');
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.getAttribute('data-theme') || (media.matches ? 'dark' : 'light');
  }

  function syncTheme() {
    if (!themeBtn) return;
    var t = currentTheme();
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store('theme', next);
      syncTheme();
    });
    media.addEventListener('change', syncTheme);
    syncTheme();
  }

  // ---------- STICKY HEADER OBSERVER ----------
  var topHeader = document.querySelector('[data-top]');
  if (topHeader && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      topHeader.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  // ---------- MOBILE NAVIGATION ----------
  var nav = document.getElementById('nav');
  var navBtn = document.querySelector('.nav-toggle');

  function setNav(open) {
    if (!nav || !navBtn) return;
    nav.classList.toggle('is-open', open);
    navBtn.setAttribute('aria-expanded', String(open));
    navBtn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  if (nav && navBtn) {
    navBtn.addEventListener('click', function () {
      setNav(navBtn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navBtn.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        navBtn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (navBtn.getAttribute('aria-expanded') === 'true' && !e.target.closest('.top')) setNav(false);
    });
  }

  // ---------- INTERACTIVE TABS (AI & TECH) ----------
  var tabBtns = document.querySelectorAll('[role="tab"]');
  var panels = document.querySelectorAll('[role="tabpanel"]');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('aria-controls');

      // Update buttons state
      tabBtns.forEach(function (b) {
        b.setAttribute('aria-selected', 'false');
      });
      btn.setAttribute('aria-selected', 'true');

      // Update panels
      panels.forEach(function (panel) {
        if (panel.id === targetId) {
          panel.classList.add('is-active');
        } else {
          panel.classList.remove('is-active');
        }
      });
    });
  });

  // ---------- INTERACTIVE BRIEF BUILDER ----------
  var briefForm = document.querySelector('[data-brief]');
  if (briefForm) {
    var statusEl = briefForm.querySelector('.brief-status');

    function buildMessage() {
      var kinds = [];
      briefForm.querySelectorAll('input[name="kind"]:checked').forEach(function (cb) {
        kinds.push(cb.value);
      });

      var whenRadio = briefForm.querySelector('input[name="when"]:checked');
      var when = whenRadio ? whenRadio.value : 'По договорённости';

      var textarea = briefForm.querySelector('textarea[name="text"]');
      var text = textarea ? textarea.value.trim() : '';

      var lines = [
        '👋 Здравствуйте! Хочу обсудить задачу / вакансию.',
        '',
        '📌 Направление: ' + (kinds.length ? kinds.join(', ') : 'Обсудить проект'),
        '⏳ Сроки: ' + when
      ];

      if (text) {
        lines.push('');
        lines.push('📝 Детали задачи:');
        lines.push(text);
      }

      return lines.join('\n');
    }

    briefForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var action = e.submitter ? e.submitter.value : 'tg';
      var msg = buildMessage();

      if (action === 'tg') {
        var tgUrl = 'https://t.me/' + TG_USER + '?text=' + encodeURIComponent(msg);
        window.open(tgUrl, '_blank', 'noopener,noreferrer');
        if (statusEl) {
          statusEl.textContent = '✓ Переходим в Telegram...';
          setTimeout(function () { statusEl.textContent = ''; }, 4000);
        }
      } else if (action === 'copy') {
        copyText(msg).then(function () {
          if (statusEl) {
            statusEl.textContent = '✓ Текст заявки скопирован в буфер обмена!';
            setTimeout(function () { statusEl.textContent = ''; }, 4000);
          }
        });
      }
    });
  }

  // ---------- COPY DATA HELPER ----------
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-copy');
      copyText(val).then(function () {
        var prevText = btn.getAttribute('title') || '';
        btn.setAttribute('title', 'Скопировано!');
        setTimeout(function () {
          btn.setAttribute('title', prevText);
        }, 2000);
      });
    });
  });

})();
