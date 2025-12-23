/** @odoo-module **/

/**
 * Course Detail Page JavaScript
 * Handles tabs, accordion, and wishlist functionality
 */

import publicWidget from '@web/legacy/js/public/public_widget';

publicWidget.registry.SeitekCourseDetail = publicWidget.Widget.extend({
    selector: '.o_seitech_course_detail',
    events: {
        'click .course-tab': '_onTabClick',
        'click .accordion-header': '_onAccordionClick',
        'click .btn-expand-all': '_onExpandAll',
        'click .wishlist-btn': '_onWishlistClick',
        'click .play-preview-btn': '_onPlayPreview',
    },

    /**
     * @override
     */
    start() {
        this._super.apply(this, arguments);
        this._initTabs();
        return Promise.resolve();
    },

    /**
     * Initialize tabs from URL hash
     */
    _initTabs() {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            const tabButton = this.el.querySelector(`.course-tab[data-tab="${hash}"]`);
            if (tabButton) {
                this._switchTab(hash);
            }
        }
    },

    /**
     * Handle tab click
     */
    _onTabClick(ev) {
        const tab = ev.currentTarget.dataset.tab;
        this._switchTab(tab);
        // Update URL hash
        history.replaceState(null, null, `#${tab}`);
    },

    /**
     * Switch active tab
     */
    _switchTab(tabName) {
        // Update tab buttons
        this.el.querySelectorAll('.course-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab panels
        this.el.querySelectorAll('.course-tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-${tabName}`);
        });
    },

    /**
     * Handle accordion section click
     */
    _onAccordionClick(ev) {
        const header = ev.currentTarget;
        const content = header.nextElementSibling;
        const isActive = header.classList.contains('active');

        // Toggle this section
        header.classList.toggle('active');
        content.style.display = isActive ? 'none' : 'block';
    },

    /**
     * Expand or collapse all accordion sections
     */
    _onExpandAll(ev) {
        const btn = ev.currentTarget;
        const isExpanded = btn.textContent.includes('Collapse');
        const headers = this.el.querySelectorAll('.accordion-header');

        headers.forEach(header => {
            const content = header.nextElementSibling;
            header.classList.toggle('active', !isExpanded);
            content.style.display = isExpanded ? 'none' : 'block';
        });

        btn.textContent = isExpanded ? 'Expand All' : 'Collapse All';
    },

    /**
     * Handle wishlist button click
     */
    _onWishlistClick(ev) {
        ev.preventDefault();
        const btn = ev.currentTarget;
        const courseId = btn.dataset.courseId;
        
        btn.classList.toggle('active');

        // Call server to toggle wishlist
        this._rpc({
            route: '/course/wishlist/toggle',
            params: {
                course_id: parseInt(courseId),
            },
        }).then(response => {
            if (response.added) {
                this.displayNotification({
                    title: 'Added to Wishlist',
                    message: 'Course has been added to your wishlist.',
                    type: 'success',
                });
            } else {
                this.displayNotification({
                    title: 'Removed from Wishlist',
                    message: 'Course has been removed from your wishlist.',
                    type: 'info',
                });
            }
        }).catch(() => {
            btn.classList.toggle('active');
            this.displayNotification({
                title: 'Error',
                message: 'Please log in to add courses to your wishlist.',
                type: 'warning',
            });
        });
    },

    /**
     * Handle preview video play
     */
    _onPlayPreview(ev) {
        ev.preventDefault();
        // This could open a modal with the preview video
        // For now, we'll just navigate to the first lesson if available
        const previewLesson = this.el.querySelector('.lesson-preview-badge')?.closest('.lesson-item');
        if (previewLesson) {
            // Navigate to preview lesson
            const lessonTitle = previewLesson.querySelector('.lesson-title');
            if (lessonTitle) {
                // Could trigger lesson preview modal here
                console.log('Preview lesson:', lessonTitle.textContent);
            }
        }
    },
});

export default publicWidget.registry.SeitekCourseDetail;
