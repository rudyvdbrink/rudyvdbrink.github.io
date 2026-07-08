// ============================================================
// Brink Data Science — blog interactions
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

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
