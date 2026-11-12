/* Capy of Gods: efectos del sitio. Sin dependencias. Todo degrada bien sin JS. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var BASE = document.documentElement.getAttribute('data-base') || '';
  var LANG = document.documentElement.getAttribute('lang') || 'en';

  /* ---------------------------------------------------------------- brasas */
  function embers() {
    var c = $('#embers');
    if (!c || reduce) return;
    var ctx = c.getContext('2d'), W, H, dpr = Math.min(window.devicePixelRatio || 1, 2), parts = [];
    var dense = document.body.classList.contains('home') ? 70 : 34;
    function size() { W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr; c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px'; }
    function spawn(initial) {
      return {
        x: Math.random() * W, y: initial ? Math.random() * H : H + 20 * dpr,
        r: (Math.random() * 2.2 + .6) * dpr, vy: (Math.random() * .6 + .25) * dpr, vx: (Math.random() - .5) * .3 * dpr,
        a: Math.random() * .6 + .3, ph: Math.random() * 6.28, hue: Math.random() < .75 ? 18 + Math.random() * 20 : 350 + Math.random() * 10
      };
    }
    size(); addEventListener('resize', size);
    for (var i = 0; i < dense; i++) parts.push(spawn(true));
    var running = true;
    document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) requestAnimationFrame(tick); });
    function tick(t) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.vy; p.x += p.vx + Math.sin(t / 900 + p.ph) * .25 * dpr;
        var fl = p.a * (.65 + .35 * Math.sin(t / 180 + p.ph * 3));
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, 'hsla(' + p.hue + ',100%,70%,' + fl + ')');
        g.addColorStop(1, 'hsla(' + p.hue + ',100%,50%,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
        if (p.y < -30) parts[i] = spawn(false);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------------- header, menú, subir */
  function chrome() {
    var hdr = $('header.site'), top = $('.to-top');
    var meter = $('.climb-meter'), fill = meter && $('.fill', meter), capy = meter && $('.capy', meter), floor = meter && $('.floor', meter);
    var floorLabel = meter ? meter.getAttribute('data-label') : '';
    var hideT;
    function onScroll() {
      var y = scrollY, max = Math.max(1, document.documentElement.scrollHeight - innerHeight), f = Math.min(1, y / max);
      if (hdr) hdr.classList.toggle('scrolled', y > 10);
      if (top) top.classList.toggle('show', y > 700);
      if (meter) {
        fill.style.height = (f * 100) + '%';
        capy.style.bottom = (f * 100) + '%';
        floor.style.bottom = (f * 100) + '%';
        floor.textContent = floorLabel + ' ' + Math.max(1, Math.round(f * 300));
        meter.classList.add('active'); clearTimeout(hideT);
        hideT = setTimeout(function () { meter.classList.remove('active'); }, 900);
      }
      parallax();
    }
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    if (top) top.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    var tg = $('.nav-toggle');
    if (tg) tg.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open'); tg.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('header.site nav a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('nav-open'); }); });
  }

  /* ---------------------------------------------------------------- parallax */
  var plx = [];
  function parallax() {
    if (reduce) return;
    for (var i = 0; i < plx.length; i++) {
      var el = plx[i], r = el.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      var k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.transform = 'translate3d(0,' + (k * -60).toFixed(1) + 'px,0)';
    }
    var hb = $('.hero .bg');
    if (hb && scrollY < innerHeight * 1.2) hb.style.transform = 'translate3d(0,' + (scrollY * .35).toFixed(1) + 'px,0)';
  }

  /* ---------------------------------------------------------------- revelado */
  function reveals() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------------------------------------------------------------- videos en bucle */
  function videos() {
    var vids = $$('video[data-auto]');
    if (!vids.length) return;
    if (!('IntersectionObserver' in window)) { vids.forEach(function (v) { v.preload = 'auto'; v.play && v.play().catch(function () {}); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && !reduce) {
          if (v.getAttribute('data-src') && !v.src) { v.src = v.getAttribute('data-src'); }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) { v.pause(); }
      });
    }, { rootMargin: '200px 0px', threshold: .01 });
    vids.forEach(function (v) { io.observe(v); });
    // Clips que se reproducen al pasar el mouse (fichas de jefes).
    $$('[data-hover-clip]').forEach(function (card) {
      var v = $('video', card); if (!v) return;
      card.addEventListener('mouseenter', function () { if (!v.src) v.src = v.getAttribute('data-src'); v.play().catch(function () {}); });
      card.addEventListener('mouseleave', function () { v.pause(); });
    });
  }

  /* ---------------------------------------------------------------- inclinación 3D */
  function tilt() {
    if (reduce || !window.matchMedia('(hover: hover)').matches) return;
    $$('.tilt').forEach(function (el) {
      if (!$('.shine', el)) { var s = document.createElement('i'); s.className = 'shine'; el.appendChild(s); }
      var max = parseFloat(el.getAttribute('data-tilt') || '7');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = 'perspective(900px) rotateX(' + ((.5 - y) * max).toFixed(2) + 'deg) rotateY(' + ((x - .5) * max).toFixed(2) + 'deg) translateY(-3px)';
        el.style.setProperty('--mx', (x * 100) + '%'); el.style.setProperty('--my', (y * 100) + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------------- lightbox */
  function lightbox() {
    var items = $$('[data-lb]');
    if (!items.length) return;
    var box = document.createElement('div'); box.className = 'lightbox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    var closeLabel = document.documentElement.getAttribute('data-close') || 'Close';
    box.innerHTML = '<button class="lb-close" aria-label="' + closeLabel + '">✕</button><button class="lb-prev" aria-label="Prev">‹</button><button class="lb-next" aria-label="Next">›</button><div class="lb-wrap"><div class="lb-holder"></div><div class="lb-cap"></div></div>';
    document.body.appendChild(box);
    var holder = $('.lb-holder', box), cap = $('.lb-cap', box), idx = 0, group = [];
    function show(i) {
      idx = (i + group.length) % group.length;
      var el = group[idx], kind = el.getAttribute('data-lb'), src = el.getAttribute('data-full'), html;
      if (kind === 'video') html = '<video class="lb-media" src="' + src + '" autoplay loop muted playsinline controls></video>';
      else if (kind === 'yt') html = '<div class="lb-media"><iframe src="' + src + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Trailer"></iframe></div>';
      else html = '<img class="lb-media" src="' + src + '" alt="">';
      holder.innerHTML = html; cap.textContent = el.getAttribute('data-cap') || '';
      $('.lb-prev', box).style.display = $('.lb-next', box).style.display = group.length > 1 ? '' : 'none';
    }
    function open(el) {
      var g = el.getAttribute('data-group');
      group = g ? items.filter(function (x) { return x.getAttribute('data-group') === g; }) : [el];
      box.classList.add('open'); document.body.style.overflow = 'hidden'; show(group.indexOf(el));
      $('.lb-close', box).focus();
    }
    function close() { box.classList.remove('open'); holder.innerHTML = ''; document.body.style.overflow = ''; }
    items.forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); open(el); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); } });
    });
    $('.lb-close', box).onclick = close;
    $('.lb-prev', box).onclick = function () { show(idx - 1); };
    $('.lb-next', box).onclick = function () { show(idx + 1); };
    box.addEventListener('click', function (e) { if (e.target === box || e.target.classList.contains('lb-wrap')) close(); });
    addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------------------------------------------------------------- tráiler en línea */
  function trailer() {
    $$('.video .poster-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var f = document.createElement('iframe');
        f.src = b.getAttribute('data-embed') + '?autoplay=1&rel=0';
        f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; f.allowFullscreen = true; f.title = 'Trailer';
        b.parentNode.replaceChild(f, b);
      });
    });
  }

  /* ---------------------------------------------------------------- contadores */
  function counters() {
    var els = $$('[data-count]');
    if (!els.length || reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return; io.unobserve(en.target);
        var el = en.target, end = parseInt(el.getAttribute('data-count'), 10), suf = el.textContent.replace(/[0-9]/g, ''), t0 = performance.now();
        (function step(t) {
          var k = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(end * e) + suf; if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: .5 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------------------------------------------------------------- spoilers */
  function spoilers() {
    $$('.spoiler .shield button').forEach(function (b) {
      b.addEventListener('click', function () {
        b.closest('.spoiler').classList.remove('locked');
        try { sessionStorage.setItem('cog-spoilers', '1'); } catch (e) {}
      });
    });
    try { if (sessionStorage.getItem('cog-spoilers') === '1') $$('.spoiler').forEach(function (s) { s.classList.remove('locked'); }); } catch (e) {}
  }

  /* ---------------------------------------------------------------- filtros de página */
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function filters() {
    $$('[data-filter-scope]').forEach(function (scope) {
      var input = $('input[data-filter]', scope.parentNode) || $('input[data-filter]'), chips = $$('.chip[data-rarity]', scope.parentNode);
      var cards = $$('[data-name]', scope), empty = $('.no-results', scope.parentNode), sections = $$('[data-section]', scope);
      var rarity = 'all';
      function apply() {
        var q = norm(input ? input.value : ''), shown = 0;
        cards.forEach(function (c) {
          var ok = (!q || norm(c.getAttribute('data-name')).indexOf(q) >= 0) && (rarity === 'all' || c.getAttribute('data-r') === rarity);
          c.classList.toggle('hidden-f', !ok); if (ok) shown++;
        });
        sections.forEach(function (s) { s.classList.toggle('hidden-f', !$$('[data-name]:not(.hidden-f)', s).length); });
        if (empty) empty.classList.toggle('show', shown === 0);
      }
      if (input) input.addEventListener('input', apply);
      chips.forEach(function (ch) {
        ch.addEventListener('click', function () {
          chips.forEach(function (x) { x.classList.remove('on'); }); ch.classList.add('on'); rarity = ch.getAttribute('data-rarity'); apply();
        });
      });
    });
  }

  /* ---------------------------------------------------------------- buscador global de la wiki */
  function search() {
    var boxes = $$('.search[data-index]');
    if (!boxes.length) return;
    var data = null, loading = null;
    function load() {
      if (data || loading) return loading;
      loading = fetch(boxes[0].getAttribute('data-index')).then(function (r) { return r.json(); }).then(function (j) { data = j; return j; });
      return loading;
    }
    boxes.forEach(function (box) {
      var input = $('input', box), res = $('.results', box), sel = -1, noneTxt = box.getAttribute('data-none') || '';
      function render() {
        var q = norm(input.value.trim());
        if (!q || !data) { box.classList.remove('open'); return; }
        var hits = data.filter(function (d) { return norm(d.n).indexOf(q) >= 0 || norm(d.d || '').indexOf(q) >= 0; })
          .sort(function (a, b) { return (norm(a.n).indexOf(q) === 0 ? 0 : 1) - (norm(b.n).indexOf(q) === 0 ? 0 : 1); }).slice(0, 12);
        sel = -1;
        res.innerHTML = hits.length ? hits.map(function (h) {
          return '<a href="' + h.u + '">' + (h.i ? '<img src="' + h.i + '" alt="" loading="lazy">' : '') + '<span>' + h.n.replace(/</g, '&lt;') + '</span><small>' + h.c + '</small></a>';
        }).join('') : '<div class="none">' + noneTxt + '</div>';
        box.classList.add('open');
      }
      input.addEventListener('focus', function () { load().then(render); });
      input.addEventListener('input', function () { load().then(render); });
      input.addEventListener('keydown', function (e) {
        var links = $$('a', res);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % Math.max(1, links.length);
          links.forEach(function (l, i) { l.classList.toggle('sel', i === sel); });
        } else if (e.key === 'Enter' && links.length) { e.preventDefault(); location.href = (links[sel] || links[0]).href; }
        else if (e.key === 'Escape') { box.classList.remove('open'); input.blur(); }
      });
      document.addEventListener('click', function (e) { if (!box.contains(e.target)) box.classList.remove('open'); });
    });
    addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); $('input', boxes[0]).focus(); }
    });
  }

  /* ---------------------------------------------------------------- saltar a un ancla resalta la tarjeta */
  function anchorFlash() {
    function flash() {
      if (!location.hash) return;
      var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!el) return;
      el.classList.add('in');
      el.animate && el.animate([{ boxShadow: '0 0 0 2px #ffcf5a, 0 0 50px #ff8a3d' }, { boxShadow: '0 0 0 0 transparent' }], { duration: 2200, easing: 'ease-out' });
    }
    addEventListener('hashchange', flash); setTimeout(flash, 300);
  }

  document.addEventListener('DOMContentLoaded', function () {
    $$('.wiki aside a, .parade').forEach(function () {});
    plx = $$('.band .bg');
    embers(); chrome(); reveals(); videos(); tilt(); lightbox(); trailer(); counters(); spoilers(); filters(); search(); anchorFlash();
  });
})();
