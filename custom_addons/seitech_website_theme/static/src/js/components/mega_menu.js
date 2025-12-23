/** @odoo-module **/

/**
 * Seitech Website Theme - Mega Menu Component
 */

document.addEventListener('DOMContentLoaded', function() {
    initMegaMenu();
});

function initMegaMenu() {
    const navItems = document.querySelectorAll('.nav-seitech-item');

    navItems.forEach(item => {
        const megaMenu = item.querySelector('.mega-menu-seitech');
        if (!megaMenu) return;

        let hideTimeout = null;

        // Show on hover (desktop)
        item.addEventListener('mouseenter', function() {
            if (window.innerWidth >= 1024) {
                clearTimeout(hideTimeout);
                closealMegaMenus();
                showMegaMenu(megaMenu);
            }
        });

        item.addEventListener('mouseleave', function() {
            if (window.innerWidth >= 1024) {
                hideTimeout = setTimeout(() => {
                    hideMegaMenu(megaMenu);
                }, 150);
            }
        });

        // Keep open when hovering over mega menu
        megaMenu.addEventListener('mouseenter', function() {
            clearTimeout(hideTimeout);
        });

        megaMenu.addEventListener('mouseleave', function() {
            hideTimeout = setTimeout(() => {
                hideMegaMenu(megaMenu);
            }, 150);
        });

        // Click toggle (for touch/mobile)
        const link = item.querySelector('.nav-seitech-link');
        if (link) {
            link.addEventListener('click', function(e) {
                if (window.innerWidth < 1024) {
                    e.preventDefault();
                    const isOpen = megaMenu.classList.contains('is-open');
                    closealMegaMenus();
                    if (!isOpen) {
                        showMegaMenu(megaMenu);
                    }
                }
            });
        }
    });

    // Close on click outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-seitech-item')) {
            closealMegaMenus();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closealMegaMenus();
        }
    });
}

function showMegaMenu(menu) {
    menu.classList.add('is-open');
    menu.style.opacity = '1';
    menu.style.visibility = 'visible';
    menu.style.transform = 'translateX(-50%) translateY(0)';

    // Focus first link for accessibility
    const firstLink = menu.querySelector('a');
    if (firstLink) {
        firstLink.focus();
    }
}

function hideMegaMenu(menu) {
    menu.classList.remove('is-open');
    menu.style.opacity = '0';
    menu.style.visibility = 'hidden';
    menu.style.transform = 'translateX(-50%) translateY(10px)';
}

function closealMegaMenus() {
    document.querySelectorAll('.mega-menu-seitech').forEach(menu => {
        hideMegaMenu(menu);
    });
}

// Keyboard navigation within mega menu
document.addEventListener('keydown', function(e) {
    const openMenu = document.querySelector('.mega-menu-seitech.is-open');
    if (!openMenu) return;

    const links = openMenu.querySelectorAll('a');
    const currentIndex = Array.from(links).indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % links.length;
        links[nextIndex].focus();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + links.length) % links.length;
        links[prevIndex].focus();
    } else if (e.key === 'Tab' && !e.shiftKey && currentIndex === links.length - 1) {
        closealMegaMenus();
    }
});
