/**
 * Yasar Memon — Portfolio
 * Scroll reveals, nav state, magnetic CTA, local time and a small email affordance.
 * Every interaction uses the shared ease curve and stays under 250ms.
 * Marquee and scroll-indicator loops live in CSS and are disabled under
 * prefers-reduced-motion.
 */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* ---------------------------------------------------------------------
     * Reveal on scroll — faded blocks and line-masked headings
     * ------------------------------------------------------------------- */

    var revealTargets = document.querySelectorAll('.reveal, .reveal-lines');

    function revealAll() {
        Array.prototype.forEach.call(revealTargets, function (el) {
            el.classList.add('is-visible');
        });
    }

    function initReveal() {
        if (!('IntersectionObserver' in window) || reduceMotion.matches) {
            revealAll();
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -10% 0px'
        });

        Array.prototype.forEach.call(revealTargets, function (el) {
            observer.observe(el);
        });
    }

    /* ---------------------------------------------------------------------
     * Active section in the nav
     * ------------------------------------------------------------------- */

    function initNavState() {
        var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
        if (!links.length) return;

        var sections = links
            .map(function (link) {
                var id = link.getAttribute('href');
                return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
            })
            .filter(Boolean);

        if (!('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                links.forEach(function (link) {
                    if (link.getAttribute('href') === '#' + entry.target.id) {
                        link.setAttribute('aria-current', 'true');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            });
        }, {
            rootMargin: '-45% 0px -50% 0px',
            threshold: 0
        });

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    /* ---------------------------------------------------------------------
     * Mobile menu
     * ------------------------------------------------------------------- */

    function initMobileMenu() {
        var toggle = document.getElementById('nav-toggle');
        var links = document.getElementById('nav-links');
        if (!toggle || !links) return;

        function setOpen(open) {
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

            if (open) {
                links.setAttribute('data-open', 'true');
            } else {
                links.removeAttribute('data-open');
            }
        }

        setOpen(false);

        toggle.addEventListener('click', function () {
            setOpen(toggle.getAttribute('aria-expanded') !== 'true');
        });

        links.addEventListener('click', function (event) {
            if (event.target.closest('a')) setOpen(false);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                setOpen(false);
                toggle.focus();
            }
        });
    }

    /* ---------------------------------------------------------------------
     * Magnetic primary CTA — capped at 3px, pointer devices only
     * ------------------------------------------------------------------- */

    var MAGNET_RANGE = 3;

    function initMagnetic() {
        var targets = document.querySelectorAll('[data-magnetic]');
        if (!targets.length || reduceMotion.matches) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        Array.prototype.forEach.call(targets, function (el) {
            var frame = null;
            var x = 0;
            var y = 0;

            function clamp(value) {
                return Math.max(-MAGNET_RANGE, Math.min(MAGNET_RANGE, value));
            }

            function apply() {
                frame = null;
                el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
            }

            function onPointerMove(event) {
                var rect = el.getBoundingClientRect();
                var offsetX = event.clientX - (rect.left + rect.width / 2);
                var offsetY = event.clientY - (rect.top + rect.height / 2);

                x = clamp((offsetX / (rect.width / 2)) * MAGNET_RANGE);
                y = clamp((offsetY / (rect.height / 2)) * MAGNET_RANGE);

                if (frame === null) frame = window.requestAnimationFrame(apply);
            }

            function release() {
                if (frame !== null) {
                    window.cancelAnimationFrame(frame);
                    frame = null;
                }
                el.style.transform = '';
            }

            el.addEventListener('pointermove', onPointerMove);
            el.addEventListener('pointerleave', release);
            el.addEventListener('pointercancel', release);
            el.addEventListener('blur', release);
        });
    }

    /* ---------------------------------------------------------------------
     * Live local time — Kolkata
     * ------------------------------------------------------------------- */

    function initLocalTime() {
        var clocks = document.querySelectorAll('[data-localtime]');
        if (!clocks.length) return;

        var formatter;
        try {
            formatter = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch (error) {
            return;
        }

        function tick() {
            var time = formatter.format(new Date());
            var label = 'Kolkata, IN — ' + time;

            Array.prototype.forEach.call(clocks, function (clock) {
                var text = clock.querySelector('.localtime__text');
                if (text) text.textContent = label;
            });
        }

        tick();
        window.setInterval(tick, 30000);

        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) tick();
        });
    }

    /* ---------------------------------------------------------------------
     * Copy email
     * ------------------------------------------------------------------- */

    function initCopyEmail() {
        var button = document.getElementById('copy-email');
        var status = document.getElementById('copy-status');
        if (!button) return;

        var label = button.querySelector('.btn__label');
        var email = button.getAttribute('data-email');
        var resetTimer;

        button.addEventListener('click', function () {
            function confirmCopied() {
                button.classList.add('is-copied');
                if (label) label.textContent = 'Copied';
                if (status) status.textContent = 'Email address copied to clipboard.';

                window.clearTimeout(resetTimer);
                resetTimer = window.setTimeout(function () {
                    button.classList.remove('is-copied');
                    if (label) label.textContent = 'Copy email';
                    if (status) status.textContent = '';
                }, 2000);
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(confirmCopied, function () {
                    window.location.href = 'mailto:' + email;
                });
                return;
            }

            window.location.href = 'mailto:' + email;
        });
    }

    /* ---------------------------------------------------------------------
     * Boot
     * ------------------------------------------------------------------- */

    function init() {
        initReveal();
        initNavState();
        initMobileMenu();
        initMagnetic();
        initLocalTime();
        initCopyEmail();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* Smooth in-page navigation, respecting reduced motion */
    document.addEventListener('click', function (event) {
        var link = event.target.closest('a[href^="#"]');
        if (!link) return;

        var hash = link.getAttribute('href');
        var target = document.querySelector(hash);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
            behavior: reduceMotion.matches ? 'auto' : 'smooth',
            block: 'start'
        });
        history.replaceState(null, '', hash);
    });
})();