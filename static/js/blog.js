// ============================================================
// Brink Data Science — blog interactions
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    // ---- Mobile nav: hamburger + popover ----
    initMobileNav();

    // ---- Open external links in a new tab ----
    document.querySelectorAll('a[href^="https://"]').forEach(link => {
        if (!link.target) link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener');
    });

    // ---- Copy button on code blocks ----
    if (navigator.clipboard) {
        document.querySelectorAll('.prose pre').forEach(pre => {
            const code = pre.querySelector('code');
            if (!code) return;
            const button = document.createElement('button');
            button.className = 'copy-btn';
            button.type = 'button';
            button.textContent = 'copy';
            button.setAttribute('aria-label', 'Copy code to clipboard');
            button.addEventListener('click', () => {
                navigator.clipboard.writeText(code.textContent).then(() => {
                    button.textContent = 'copied';
                    setTimeout(() => { button.textContent = 'copy'; }, 1500);
                });
            });
            pre.appendChild(button);
        });
    }
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
