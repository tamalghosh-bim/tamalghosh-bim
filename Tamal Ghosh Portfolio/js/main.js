/* Tamal Ghosh — portfolio interactions.
   Plain JavaScript, no libraries. Every effect is optional:
   without JS (or with reduced motion) the page is fully readable. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------- reveal on scroll ---------- */
  var revealTargets = $$('.reveal, .sec-head, .figure, .map, .sectors, .ladder, .lab__list, .cs-art, .outcomes');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  // hero plays on load
  var hero = $('.hero');
  if (hero) requestAnimationFrame(function () { setTimeout(function () { hero.classList.add('is-in'); }, 60); });

  /* ---------- nav: scrolled state, progress, active link, mobile menu ---------- */
  var nav = $('#nav');
  var progress = $('#progress');
  var toggle = $('.nav__toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('#menu a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  var sections = $$('[data-sheet]');
  var navLinks = $$('.nav__links a');
  var sheet = $('#sheet'), sheetNo = $('#sheet-no'), sheetTitle = $('#sheet-title'), chain = $('#chain');
  var totop = $('#totop'), mbar = $('#mbar');
  var timeline = $('#timeline');
  var tlItems = $$('.tl__item');
  var toc = $$('.cs-toc a');
  var lastSheet = '';

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    var docH = document.documentElement.scrollHeight - vh;
    if (nav) nav.classList.toggle('is-scrolled', y > 10);
    if (progress) progress.style.transform = 'scaleX(' + (docH > 0 ? y / docH : 0) + ')';

    var past = y > vh * 0.6;
    if (sheet) sheet.classList.toggle('is-on', past);
    if (totop) totop.classList.toggle('is-on', past);
    if (mbar) mbar.classList.toggle('is-on', past);

    // which section is under the middle of the screen
    var mid = vh * 0.45, current = null;
    sections.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) current = s;
    });
    if (current) {
      var id = current.id;
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
      if (sheetNo && current.dataset.sheet !== lastSheet) {
        lastSheet = current.dataset.sheet;
        sheetNo.textContent = current.dataset.sheet;
        sheetTitle.textContent = current.dataset.title;
      }
    }
    if (chain) {
      var m = Math.round(y / 2);
      chain.textContent = Math.floor(m / 1000) + '+' + String(m % 1000).padStart(3, '0');
    }

    // experience timeline fills as you read it
    if (timeline) {
      var tr = timeline.getBoundingClientRect();
      var p = clamp((vh * 0.6 - tr.top) / tr.height, 0, 1);
      timeline.style.setProperty('--p', reduce ? 1 : p.toFixed(4));
      tlItems.forEach(function (li) { li.classList.toggle('is-lit', reduce || li.getBoundingClientRect().top < vh * 0.6); });
    }

    // case-study table of contents
    if (toc.length) {
      var active = null;
      toc.forEach(function (a) {
        var t = document.getElementById(a.getAttribute('href').slice(1));
        if (t && t.getBoundingClientRect().top < vh * 0.4) active = a;
      });
      toc.forEach(function (a) { a.classList.toggle('is-active', a === active); });
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (totop) totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- number count-up ---------- */
  var counters = $$('[data-count]');
  function countUp(el) {
    var end = parseFloat(el.dataset.count), dur = 1600, t0 = null;
    if (reduce) { el.textContent = end; return; }
    function step(t) {
      if (!t0) t0 = t;
      var k = clamp((t - t0) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(end * eased);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { setTimeout(function () { countUp(e.target); }, 250); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else counters.forEach(function (c) { c.textContent = c.dataset.count; });

  /* ---------- hero corridor: chainage ticks, structures, travelling surveyor ---------- */
  var corridor = $('#corridor');
  if (corridor) {
    var cl = $('#cl', corridor);
    var ticks = $('#ticks', corridor), nodes = $('#nodes', corridor), surveyor = $('#surveyor', corridor);
    var L = 0;
    try { L = cl.getTotalLength(); } catch (err) { L = 0; }
    var pt = function (d, off) {
      var a = cl.getPointAtLength(clamp(d, 0, L)), b = cl.getPointAtLength(clamp(d + 1, 0, L));
      var dx = b.x - a.x, dy = b.y - a.y, n = Math.hypot(dx, dy) || 1;
      return { x: a.x + (-dy / n) * (off || 0), y: a.y + (dx / n) * (off || 0), nx: -dy / n, ny: dx / n, ang: Math.atan2(dy, dx) * 180 / Math.PI };
    };
    var make = function (tag, attrs, parent) {
      var el = document.createElementNS(SVGNS, tag);
      for (var k in attrs) el.setAttribute(k, attrs[k]);
      parent.appendChild(el);
      return el;
    };
    if (L > 0) {
      var x0 = 40; // first tick on screen
      for (var d = x0, i = 0; d < L - 20; d += 60, i++) {
        var p = pt(d), major = i % 4 === 0, len = major ? 11 : 6;
        var tk = make('line', {
          x1: (p.x - p.nx * len).toFixed(1), y1: (p.y - p.ny * len).toFixed(1),
          x2: (p.x + p.nx * len).toFixed(1), y2: (p.y + p.ny * len).toFixed(1),
          stroke: major ? 'var(--ink)' : 'rgba(15,27,45,.45)', 'stroke-width': major ? 1.3 : 1,
          class: 'fade', style: '--d:' + (0.9 + d / L * 1.6).toFixed(2) + 's'
        }, ticks);
        if (major) {
          var q = pt(d, 66);
          var m = Math.round((d - x0) * 0.5);
          var t = make('text', { x: q.x.toFixed(1), y: q.y.toFixed(1), 'text-anchor': 'middle', class: 'chain-label fade', style: '--d:' + (1.1 + d / L * 1.6).toFixed(2) + 's' }, ticks);
          t.textContent = Math.floor(m / 1000) + '+' + String(m % 1000).padStart(3, '0');
        }
      }
      // manholes on the water line, pull boxes on power, handholes on telecom
      var addNodes = function (start, step, off, kind, color) {
        for (var s = start; s < L - 30; s += step) {
          var p = pt(s), y = p.y + off, x = p.x;
          var delay = '--d:' + (1.3 + s / L * 1.5).toFixed(2) + 's';
          if (kind === 'circle') make('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 5, fill: '#fff', stroke: color, 'stroke-width': 1.6, class: 'fade', style: delay }, nodes);
          else make('rect', { x: (x - 5).toFixed(1), y: (y - 5).toFixed(1), width: 10, height: 10, fill: '#fff', stroke: color, 'stroke-width': 1.6, class: 'fade', style: delay, transform: 'rotate(' + p.ang.toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')' }, nodes);
        }
      };
      addNodes(150, 230, 36, 'circle', 'var(--water)');
      addNodes(260, 300, 48, 'rect', 'var(--power)');
      addNodes(90, 270, -36, 'rect', 'var(--telecom)');

      // a surveyor walking the alignment, forever (only while visible)
      if (!reduce && surveyor) {
        var visible = true, start = null, period = 16000, delayStart = 2600;
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(corridor);
        }
        var loop = function (t) {
          if (start === null) start = t;
          var el = t - start - delayStart;
          if (visible && el > 0) {
            var k = (el % period) / period;
            var p = pt(k * L);
            surveyor.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')');
            var edge = Math.min(k, 1 - k) * 20;
            surveyor.setAttribute('opacity', clamp(edge, 0, 1).toFixed(2));
          }
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      }
    }
  }

  /* ---------- CAD crosshair in the hero (mouse only) ---------- */
  var cad = $('.cad');
  if (cad && hero && finePointer && !reduce) {
    var cx = $('.cad__x', cad), cy = $('.cad__y', cad), box = $('.cad__box', cad), read = $('.cad__read', cad);
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      cx.style.transform = 'translateY(' + y + 'px)';
      cy.style.transform = 'translateX(' + x + 'px)';
      box.style.transform = read.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      // pretend survey coordinates (UTM 40N, Abu Dhabi-ish)
      var E = 234500 + x * 0.25, N = 2716800 - y * 0.25;
      read.textContent = 'E ' + E.toFixed(2) + '   N ' + N.toFixed(2);
    });
  }

  /* ---------- project cards: redraw their line art on hover ---------- */
  $$('.card').forEach(function (card) {
    var busy = false;
    card.addEventListener('mouseenter', function () {
      if (reduce || busy || !card.classList.contains('is-in')) return;
      busy = true;
      var draws = $$('.draw', card);
      draws.forEach(function (d) { d.style.transition = 'none'; d.style.strokeDashoffset = '1'; });
      void card.offsetWidth;
      draws.forEach(function (d) { d.style.transition = ''; d.style.strokeDashoffset = ''; });
      setTimeout(function () { busy = false; }, 1800);
    });
  });

  /* ---------- AI editor: typing demo ---------- */
  var editor = $('#editor');
  if (editor) {
    var TABS = [
      {
        prompt: 'Write an AutoLISP routine that labels every utility crossing with both pipe names and the vertical clearance.',
        code:
          '<span class="c">;; Label every utility crossing with clearance</span>\n' +
          '(<span class="k">defun</span> <span class="f">c:XLABEL</span> (/ ss i a pts dz)\n' +
          '  (<span class="k">setq</span> ss (<span class="f">ssget</span> <span class="s">"_X"</span> \'((0 . <span class="s">"AECC_PIPE"</span>))))\n' +
          '  (<span class="k">setq</span> i <span class="n">0</span>)\n' +
          '  (<span class="k">repeat</span> (<span class="f">sslength</span> ss)\n' +
          '    (<span class="k">setq</span> a (<span class="f">vlax-ename-&gt;vla-object</span> (<span class="f">ssname</span> ss i)))\n' +
          '    (<span class="k">foreach</span> b (<span class="f">crossing-pipes</span> a ss)\n' +
          '      (<span class="k">setq</span> pts (<span class="f">intersect</span> a b)\n' +
          '            dz  (<span class="f">clearance</span> a b pts))\n' +
          '      (<span class="f">place-label</span> pts\n' +
          '        (<span class="f">strcat</span> (<span class="f">pipe-name</span> a) <span class="s">" / "</span> (<span class="f">pipe-name</span> b)\n' +
          '                <span class="s">"  CLR "</span> (<span class="f">rtos</span> dz <span class="n">2 2</span>) <span class="s">" m"</span>)))\n' +
          '    (<span class="k">setq</span> i (<span class="f">1+</span> i)))\n' +
          '  (<span class="f">princ</span>))',
        out: [
          '<span class="hl">Command: XLABEL</span>',
          '<span class="ok">✓ 248 crossings labelled in 4.2 s</span>',
          'Manual estimate ~3 h · reviewed &amp; signed off by engineer'
        ]
      },
      {
        prompt: 'Write a Dynamo Python node that flags every pipe with less than 0.60 m of cover and lists them for review.',
        code:
          '<span class="c"># Dynamo · Python node: flag pipes with low cover</span>\n' +
          'pipes     = IN[<span class="n">0</span>]\n' +
          'min_cover = IN[<span class="n">1</span>]          <span class="c"># 0.60 m</span>\n' +
          'issues    = []\n\n' +
          '<span class="k">for</span> p <span class="k">in</span> pipes:\n' +
          '    cover = p.SurfaceElevation - p.TopElevation\n' +
          '    <span class="k">if</span> cover &lt; min_cover:\n' +
          '        issues.<span class="f">append</span>((p.Name, <span class="f">round</span>(cover, <span class="n">2</span>)))\n\n' +
          'issues.<span class="f">sort</span>(key=<span class="k">lambda</span> x: x[<span class="n">1</span>])\n' +
          'OUT = issues',
        out: [
          '<span class="hl">Run: cover_qa.dyn</span>',
          '<span class="ok">✓ 1,340 pipes checked · 17 below minimum cover</span>',
          'Report exported → QA_cover.xlsx'
        ]
      }
    ];
    var codeEl = $('#code', editor), outEl = $('#out', editor), promptEl = $('#prompt-text', editor);
    var tabs = $$('.editor__tab', editor), replay = $('.editor__replay', editor);
    var run = 0, current = 0;

    var tokens = function (html) {
      var tmp = document.createElement('div'); tmp.innerHTML = html;
      return Array.prototype.map.call(tmp.childNodes, function (n) {
        return { cls: n.nodeType === 1 ? n.className : null, text: n.textContent };
      });
    };
    var wait = function (ms, id) { return new Promise(function (res, rej) { setTimeout(function () { id === run ? res() : rej('stale'); }, ms); }); };

    var play = function (idx) {
      var id = ++run, tab = TABS[idx];
      current = idx;
      tabs.forEach(function (t, i) { t.classList.toggle('is-on', i === idx); t.setAttribute('aria-selected', i === idx ? 'true' : 'false'); });
      codeEl.innerHTML = ''; outEl.innerHTML = ''; promptEl.textContent = '';
      if (reduce) {
        promptEl.textContent = tab.prompt; codeEl.innerHTML = tab.code;
        outEl.innerHTML = tab.out.map(function (o) { return '<div class="show">' + o + '</div>'; }).join('');
        return;
      }
      var caret = document.createElement('span'); caret.className = 'caret';
      var chain = Promise.resolve();
      // 1. prompt
      chain = chain.then(function () {
        promptEl.appendChild(caret);
        var s = tab.prompt, i = 0;
        return new Promise(function (res, rej) {
          (function tick() {
            if (id !== run) return rej('stale');
            promptEl.insertBefore(document.createTextNode(s.slice(i, i + 2)), caret); i += 2;
            if (i < s.length) setTimeout(tick, 14); else res();
          })();
        });
      }).then(function () { return wait(450, id); })
      // 2. code
      .then(function () {
        codeEl.appendChild(caret);
        var toks = tokens(tab.code), ti = 0, ci = 0, node = null;
        return new Promise(function (res, rej) {
          (function tick() {
            if (id !== run) return rej('stale');
            for (var burst = 0; burst < 2; burst++) {
              if (ti >= toks.length) return res();
              var tk = toks[ti];
              if (!node) {
                node = tk.cls ? document.createElement('span') : document.createTextNode('');
                if (tk.cls) node.className = tk.cls;
                codeEl.insertBefore(node, caret);
              }
              var ch = tk.text.charAt(ci++);
              if (tk.cls) node.textContent += ch; else node.data += ch;
              if (ci >= tk.text.length) { ti++; ci = 0; node = null; }
              if (ch === '\n') break;
            }
            setTimeout(tick, ch === '\n' ? 90 : 16);
          })();
        });
      }).then(function () { return wait(350, id); })
      // 3. output
      .then(function () {
        caret.remove();
        var lines = tab.out.map(function (o) { var d = document.createElement('div'); d.innerHTML = o; outEl.appendChild(d); return d; });
        return lines.reduce(function (p, d, i) {
          return p.then(function () { return wait(i === 0 ? 100 : 600, id); }).then(function () { d.classList.add('show'); });
        }, Promise.resolve());
      }).catch(function () {});
    };

    tabs.forEach(function (t, i) { t.addEventListener('click', function () { play(i); }); });
    if (replay) replay.addEventListener('click', function () { play(current); });
    if ('IntersectionObserver' in window) {
      var eio = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { play(0); eio.disconnect(); }
      }, { threshold: 0.35 });
      eio.observe(editor);
    } else play(0);
  }

  /* ---------- contact form → email app ---------- */
  var form = $('#form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      if (!f.name.value.trim() || !f.message.value.trim()) {
        (f.name.value.trim() ? f.message : f.name).focus();
        return;
      }
      var to = (document.querySelector('a[href^="mailto:"]') || {}).getAttribute ? document.querySelector('a[href^="mailto:"]').getAttribute('href').slice(7) : '';
      var subject = 'Portfolio enquiry: ' + f.topic.value + (f.company.value.trim() ? ' (' + f.company.value.trim() + ')' : '');
      var body = f.message.value.trim() + '\n\n— ' + f.name.value.trim() + (f.company.value.trim() ? ', ' + f.company.value.trim() : '');
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
