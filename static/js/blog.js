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

            // The <pre> is the horizontal scroll container, so a button inside
            // it drifts with the code. Wrap it in a static box and hang the
            // button off that instead, pinning it to the visible corner.
            const wrap = document.createElement('div');
            wrap.className = 'code-block';
            // The language tag scrolls away for the same reason, so it moves
            // to the wrapper too; the <pre> keeps the attribute as a no-JS
            // fallback and the CSS hides whichever copy is redundant.
            if (pre.dataset.lang) wrap.dataset.lang = pre.dataset.lang;
            pre.parentNode.insertBefore(wrap, pre);
            wrap.appendChild(pre);

            const button = document.createElement('button');
            button.className = 'copy-btn';
            button.type = 'button';
            button.innerHTML = COPY_ICON;
            button.setAttribute('aria-label', 'Copy code to clipboard');
            button.addEventListener('click', () => {
                navigator.clipboard.writeText(code.textContent).then(() => {
                    button.innerHTML = CHECK_ICON;
                    button.classList.add('is-copied');
                    button.setAttribute('aria-label', 'Copied to clipboard');
                    setTimeout(() => {
                        button.innerHTML = COPY_ICON;
                        button.classList.remove('is-copied');
                        button.setAttribute('aria-label', 'Copy code to clipboard');
                    }, 1500);
                });
            });
            wrap.appendChild(button);
        });
    }
});

// Two superimposed rectangles, and the checkmark shown after a copy.
const COPY_ICON =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<rect x="9" y="9" width="12" height="12" rx="2"/>' +
    '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
    '</svg>';

const CHECK_ICON =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M20 6L9 17l-5-5"/>' +
    '</svg>';

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
