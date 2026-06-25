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

    // ---- Reveal cards and section heads as they enter the viewport ----
    const revealEls = document.querySelectorAll('.card, .section-head');
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
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
        revealEls.forEach(el => revealer.observe(el));
    }

    // ---- Pause the hero animation while it's scrolled out of view ----
    const heroNet = document.querySelector('.hero-net');
    const home = document.getElementById('home');
    if (heroNet && home && !reduceMotion && 'IntersectionObserver' in window) {
        const heroSpy = new IntersectionObserver((entries) => {
            entries.forEach(entry => heroNet.classList.toggle('is-paused', !entry.isIntersecting));
        }, { threshold: 0 });
        heroSpy.observe(home);
    }

    // ---- Open external links in a new tab ----
    document.querySelectorAll('a[href^="https://"]').forEach(link => {
        if (!link.target) link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener');
    });
});

// ============================================================
// Portfolio image modal
// ============================================================

// White logos sit on a brand-teal plate; everything else on light.
const BRAND_PLATE_IMAGES = ['llmlynx_logo_notext.png', 'bm_logo.png'];

function showImage(img) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');

    // Swap the Smart Sampling thumbnail for the full-detail version.
    modalImg.src = img.src.includes('smart_sampling_clean.png')
        ? img.src.replace('smart_sampling_clean.png', 'smart_sampling.png')
        : img.src;

    modalImg.alt = img.alt || '';
    modalImg.style.background = BRAND_PLATE_IMAGES.some(name => img.src.includes(name))
        ? 'linear-gradient(135deg, #3C88A8, #266D8C)'
        : 'var(--plate)';

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
