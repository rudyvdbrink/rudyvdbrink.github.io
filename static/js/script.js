// ============================================================
// Brink Data Science — interactions
// Smooth scrolling is handled in CSS (scroll-behavior + scroll-margin-top).
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
// ============================================================

function showImage(img) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');

    // Swap the Smart Sampling thumbnail for the full-detail version.
    modalImg.src = img.src.includes('smart_sampling_clean.png')
        ? img.src.replace('smart_sampling_clean.png', 'smart_sampling.png')
        : img.src;

    modalImg.alt = img.alt || '';
    modal.style.display = 'block';
    document.addEventListener('keydown', onModalKey);
}

function closeModal() {
    document.getElementById('image-modal').style.display = 'none';
    document.removeEventListener('keydown', onModalKey);
}

function onModalKey(event) {
    if (event.key === 'Escape') closeModal();
}

// Close when clicking the backdrop (outside the image).
document.getElementById('image-modal').addEventListener('click', function (event) {
    if (event.target === this) closeModal();
});
