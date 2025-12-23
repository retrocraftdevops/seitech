/** @odoo-module **/

/**
 * Progress Tracker - Tracks and displays course progress
 */
class ProgressTracker {
    constructor(options = {}) {
        this.enrollmentId = options.enrollmentId;
        this.courseId = options.courseId;
        this.progressBar = document.querySelector('.course-progress-bar');
        this.progressText = document.querySelector('.course-progress-text');
        this.completedCount = document.querySelector('.completed-count');
        this.totalCount = document.querySelector('.total-count');

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadProgress();
    }

    bindEvents() {
        // Listen for lesson completion events
        document.addEventListener('lessonCompleted', (e) => {
            this.updateProgress(e.detail);
        });
    }

    async loadProgress() {
        // Progress is typically loaded with the page
        // This method can be used for dynamic updates
    }

    updateProgress(data) {
        if (!data) return;

        const percentage = data.percentage || 0;
        const completed = data.completed || 0;
        const total = data.total || 0;

        // Update progress bar
        if (this.progressBar) {
            this.progressBar.style.width = `${percentage}%`;
            this.progressBar.setAttribute('aria-valuenow', percentage);
        }

        // Update text
        if (this.progressText) {
            this.progressText.textContent = `${Math.round(percentage)}%`;
        }

        // Update counts
        if (this.completedCount) {
            this.completedCount.textContent = completed;
        }
        if (this.totalCount) {
            this.totalCount.textContent = total;
        }

        // Check for course completion
        if (percentage >= 100) {
            this.showCourseComplete();
        }
    }

    showCourseComplete() {
        // Create completion modal
        const modal = document.createElement('div');
        modal.className = 'course-complete-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-icon">🎉</div>
                <h2>Congratulations!</h2>
                <p>You've completed the course!</p>
                <div class="modal-actions">
                    <a href="/my/certificates" class="btn-primary">View Certificate</a>
                    <button class="btn-secondary" onclick="this.closest('.course-complete-modal').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// Course Sidebar Navigation
class CourseSidebar {
    constructor(element) {
        this.element = element;
        this.init();
    }

    init() {
        this.bindEvents();
        this.highlightCurrent();
    }

    bindEvents() {
        // Collapse/expand sections
        this.element.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.course-section');
                section.classList.toggle('collapsed');
            });
        });
    }

    highlightCurrent() {
        const currentSlide = this.element.querySelector('.slide-item.current');
        if (currentSlide) {
            currentSlide.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Progress tracker
    const progressContainer = document.querySelector('.course-progress-container');
    if (progressContainer) {
        new ProgressTracker({
            enrollmentId: progressContainer.dataset.enrollmentId,
            courseId: progressContainer.dataset.courseId,
        });
    }

    // Sidebar
    const sidebar = document.querySelector('.course-sidebar');
    if (sidebar) {
        new CourseSidebar(sidebar);
    }
});

export { ProgressTracker, CourseSidebar };
