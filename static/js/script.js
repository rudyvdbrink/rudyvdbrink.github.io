// ============================================================
// Brink Data Science — interactions
// Smooth scrolling is handled in CSS (scroll-behavior + scroll-margin-top).
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Mobile nav (built before the scroll-spy so its cloned links
    //      are picked up and highlighted too) ----
    initMobileNav();

    // ---- Scroll-spy: highlight the nav link for the section in view ----
    const sections = document.querySelectorAll('main > section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function setActive(id) {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
    }

    if ('IntersectionObserver' in window) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
        sections.forEach(section => spy.observe(section));
    }

    // ---- Reveal content as it enters the viewport ----
    const revealEls = document.querySelectorAll('.section-head, .service, .project, .contact-grid');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(el => el.classList.add('is-visible'));
    } else {
        revealEls.forEach(el => el.classList.add('reveal'));
        const revealer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
        revealEls.forEach(el => revealer.observe(el));
    }

    // ---- Pause the hero animation while it's scrolled out of view ----
    const heroViz = document.querySelector('.hero-viz');
    const home = document.getElementById('home');
    if (heroViz && home && !reduceMotion && 'IntersectionObserver' in window) {
        const heroSpy = new IntersectionObserver((entries) => {
            entries.forEach(entry => heroViz.classList.toggle('is-paused', !entry.isIntersecting));
        }, { threshold: 0 });
        heroSpy.observe(home);
    }

    // ---- Rotating panel images (Smart Sampling) ----
    // Crossfade through the stacked images every 20 s, pausing while the
    // panel is scrolled out of view. The modal never auto-rotates.
    document.querySelectorAll('.panel-stack').forEach(stack => {
        const images = Array.from(stack.querySelectorAll('img'));
        if (images.length < 2) return;
        const caption = stack.closest('.panel').querySelector('.panel-caption');
        let index = 0;
        let inView = true;

        function setCaption() {
            const label = images[index].dataset.caption;
            if (caption && label) caption.textContent = label + ' — click to enlarge';
        }
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => {
                entries.forEach(entry => { inView = entry.isIntersecting; });
            }, { threshold: 0 }).observe(stack);
        }
        setInterval(() => {
            if (!inView) return;
            index = (index + 1) % images.length;
            images.forEach((img, i) => img.classList.toggle('is-active', i === index));
            setCaption();
        }, 20000);
        setCaption();
    });

    // ---- Animated AutoHPSearch logo ----
    // The burst of the original logo, rebuilt as a symmetric sphere-like
    // object and spun slowly about the central vertical axis. All spokes
    // share one length and one dot size in 3D; spokes sit at 90° and 45°
    // to the axis (plus the two poles on the axis itself). Each frame the
    // tips are rotated and perspective-projected. Depth is conveyed by
    // shading toward the panel color — never by transparency — and the
    // dots are drawn back-to-front on top of the lines, so no line ever
    // shows through a circle.
    const hpSpin = document.querySelector('.hp-spin');
    if (hpSpin) {
        const SVG_NS = 'http://www.w3.org/2000/svg';
        const BLUE = [0, 155, 235];   // #009BEB, the logo's own color
        const SHADE = [19, 28, 51];   // panel-dark to shade distant spokes toward
        const LEN = 92;
        const DOT = 7;
        const DIAGONAL_SCALE = 0.9;   // 45° spokes sit a touch shorter, dots a touch smaller
        const PERSPECTIVE = 320;
        const RAD = Math.PI / 180;
        // View the sphere from a slightly raised vantage point: a fixed
        // pitch applied after the spin, tipping the top toward the camera.
        const TILT = -16 * RAD;
        const TILT_SIN = Math.sin(TILT);
        const TILT_COS = Math.cos(TILT);

        // Poles + equator ring (90° to the axis) + two 45° rings,
        // azimuthally staggered for even coverage.
        const specs = [{ az: 0, el: 90 }, { az: 0, el: -90 }];
        [0, 90, 180, 270].forEach(az => specs.push({ az: az, el: 0 }));
        [45, 135, 225, 315].forEach(az => {
            specs.push({ az: az, el: 45, diagonal: true });
            specs.push({ az: az, el: -45, diagonal: true });
        });

        const burstLayer = document.createElementNS(SVG_NS, 'g');
        hpSpin.appendChild(burstLayer);

        const rays = specs.map(spec => {
            const el = spec.el * RAD;
            const az = spec.az * RAD;
            const len = spec.diagonal ? LEN * DIAGONAL_SCALE : LEN;
            const line = document.createElementNS(SVG_NS, 'line');
            const circle = document.createElementNS(SVG_NS, 'circle');
            line.setAttribute('stroke-linecap', 'round');
            burstLayer.appendChild(line);
            burstLayer.appendChild(circle);
            return {
                x: Math.cos(el) * Math.cos(az) * len,
                y: -Math.sin(el) * len,
                z: Math.cos(el) * Math.sin(az) * len,
                dot: spec.diagonal ? DOT * DIAGONAL_SCALE : DOT,
                line: line,
                circle: circle,
                lineDepth: 0,
                dotDepth: 0
            };
        });

        function depthColor(depth) {
            // depth 1 = nearest (pure logo blue), 0 = farthest (shaded)
            const mix = 0.6 * (1 - depth);
            const channel = i => Math.round(BLUE[i] + (SHADE[i] - BLUE[i]) * mix);
            return 'rgb(' + channel(0) + ',' + channel(1) + ',' + channel(2) + ')';
        }

        function renderBurst(theta) {
            const sin = Math.sin(theta);
            const cos = Math.cos(theta);
            rays.forEach(ray => {
                // spin about the vertical axis...
                const x = ray.x * cos + ray.z * sin;
                const zSpun = -ray.x * sin + ray.z * cos;
                // ...then pitch for the raised viewpoint
                const y = ray.y * TILT_COS - zSpun * TILT_SIN;
                const z = ray.y * TILT_SIN + zSpun * TILT_COS;
                const scale = PERSPECTIVE / (PERSPECTIVE - z);
                const color = depthColor((z / LEN + 1) / 2);
                // Painter's algorithm keys: a line spans from the center
                // (z = 0) to its tip, so its midpoint depth stands in for
                // the whole stroke; the dot sorts by its tip depth but
                // never before its own line, so it always caps the spoke.
                ray.lineDepth = z / 2;
                ray.dotDepth = Math.max(z, ray.lineDepth) + 0.01;
                ray.line.setAttribute('x2', x * scale);
                ray.line.setAttribute('y2', y * scale);
                ray.line.setAttribute('stroke-width', 2.2 * scale);
                ray.line.setAttribute('stroke', color);
                ray.circle.setAttribute('cx', x * scale);
                ray.circle.setAttribute('cy', y * scale);
                ray.circle.setAttribute('r', ray.dot * scale);
                ray.circle.setAttribute('fill', color);
            });
            // Repaint every primitive back-to-front so what's on top on
            // screen matches what's nearest in 3D space
            rays.flatMap(ray => [
                { depth: ray.lineDepth, node: ray.line },
                { depth: ray.dotDepth, node: ray.circle }
            ]).sort((a, b) => a.depth - b.depth)
              .forEach(item => burstLayer.appendChild(item.node));
        }

        if (reduceMotion) {
            renderBurst(0.6); // a fixed, gently angled pose
        } else {
            let spinning = true;
            if ('IntersectionObserver' in window) {
                new IntersectionObserver(entries => {
                    entries.forEach(entry => { spinning = entry.isIntersecting; });
                }, { threshold: 0 }).observe(hpSpin);
            }
            const REVOLUTION_MS = 18000;
            requestAnimationFrame(function tick(now) {
                if (spinning) renderBurst((now / REVOLUTION_MS) * 2 * Math.PI);
                requestAnimationFrame(tick);
            });
        }
    }

    // ---- Audio demo player (Making Audiobooks) ----
    document.querySelectorAll('.audio-demo').forEach(demo => {
        const audio = demo.querySelector('audio');
        const button = demo.querySelector('.demo-play');
        const track = demo.querySelector('.demo-track');
        const progress = demo.querySelector('.demo-progress');
        const time = demo.querySelector('.demo-time');

        const format = s => {
            s = Math.max(0, Math.floor(s || 0));
            return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
        };

        audio.addEventListener('loadedmetadata', () => { time.textContent = format(audio.duration); });

        button.addEventListener('click', () => {
            if (audio.paused) { audio.play(); } else { audio.pause(); }
        });
        audio.addEventListener('play', () => {
            demo.classList.add('is-playing');
            button.setAttribute('aria-label', 'Pause voice demo');
        });
        audio.addEventListener('pause', () => {
            demo.classList.remove('is-playing');
            button.setAttribute('aria-label', 'Play voice demo');
        });
        audio.addEventListener('ended', () => {
            audio.currentTime = 0;
            progress.style.width = '0%';
            time.textContent = format(audio.duration);
        });

        audio.addEventListener('timeupdate', () => {
            if (!audio.duration) return;
            progress.style.width = (audio.currentTime / audio.duration) * 100 + '%';
            time.textContent = format(audio.currentTime);
        });

        // Click-to-seek on the track
        track.addEventListener('click', event => {
            if (!audio.duration) return;
            const rect = track.getBoundingClientRect();
            const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
            audio.currentTime = ratio * audio.duration;
        });
    });

    // ---- Open external links in a new tab ----
    document.querySelectorAll('a[href^="https://"]').forEach(link => {
        if (!link.target) link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener');
    });
});

// ============================================================
// Portfolio image modal
// All project imagery sits on the dark panel surface, so the
// modal plate is dark too (set in CSS via .modal-content).
// Images inside a .panel-stack open as a small gallery with
// prev/next chevrons; the modal itself never auto-rotates.
// An image's data-full attribute points to a higher-detail
// version to show in place of the thumbnail.
// ============================================================

let modalGallery = [];
let modalIndex = 0;

function renderModalImage() {
    const item = modalGallery[modalIndex];
    const modalImg = document.getElementById('modal-image');
    modalImg.src = item.dataset.full || item.src;
    modalImg.alt = item.alt || '';
}

function showImage(img) {
    const modal = document.getElementById('image-modal');
    const stack = img.closest('.panel-stack');
    modalGallery = stack ? Array.from(stack.querySelectorAll('img')) : [img];
    modalIndex = Math.max(0, modalGallery.indexOf(img));
    modal.classList.toggle('has-gallery', modalGallery.length > 1);
    renderModalImage();
    modal.style.display = 'block';
    document.addEventListener('keydown', onModalKey);
}

function stepModal(direction) {
    if (modalGallery.length < 2) return;
    modalIndex = (modalIndex + direction + modalGallery.length) % modalGallery.length;
    renderModalImage();
}

function closeModal() {
    document.getElementById('image-modal').style.display = 'none';
    document.removeEventListener('keydown', onModalKey);
}

function onModalKey(event) {
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft') stepModal(-1);
    if (event.key === 'ArrowRight') stepModal(1);
}

// Close when clicking the backdrop (outside the image).
document.getElementById('image-modal').addEventListener('click', function (event) {
    if (event.target === this) closeModal();
});

// ============================================================
// Mobile navigation
// On narrow screens the banner can't fit the full wordmark and
// the section links, so the links move into a popover behind a
// hamburger button. The popover is cloned from the existing
// <nav>, which stays the single source of truth for the links.
// ============================================================

function initMobileNav() {
    const banner = document.getElementById('banner');
    if (!banner) return;
    const primaryNav = banner.querySelector('nav[aria-label="Primary"]');
    if (!primaryNav) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'nav-popover');
    toggle.innerHTML = '<span></span><span></span><span></span>';

    const popover = document.createElement('div');
    popover.className = 'nav-popover';
    popover.id = 'nav-popover';
    const menu = document.createElement('nav');
    menu.setAttribute('aria-label', 'Menu');
    primaryNav.querySelectorAll('a').forEach(link => {
        const clone = link.cloneNode(true);
        clone.classList.add('nav-popover-link');
        menu.appendChild(clone);
    });
    popover.appendChild(menu);

    banner.appendChild(toggle);
    banner.appendChild(popover);
    banner.classList.add('nav-ready');

    function setOpen(open) {
        popover.classList.toggle('is-open', open);
        toggle.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', event => {
        event.stopPropagation();
        setOpen(!popover.classList.contains('is-open'));
    });
    popover.addEventListener('click', event => {
        if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', event => {
        if (popover.classList.contains('is-open') &&
            !popover.contains(event.target) && !toggle.contains(event.target)) {
            setOpen(false);
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') setOpen(false);
    });
}
