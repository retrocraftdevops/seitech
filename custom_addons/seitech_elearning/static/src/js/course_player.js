/** @odoo-module **/

import { rpc } from "@web/core/network/rpc";

/**
 * Course Player - Enhanced video player with progress tracking
 * Integrates with Seitech video progress tracking system
 */
class CoursePlayer {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            enrollmentId: options.enrollmentId,
            slideId: options.slideId,
            autoTrack: options.autoTrack !== false,
            saveInterval: options.saveInterval || 10, // Save every 10 seconds
            ...options,
        };

        this.startTime = Date.now();
        this.lastUpdate = Date.now();
        this.lastSavePosition = 0;
        this.isPlaying = false;
        this.completed = false;

        this.init();
    }

    async init() {
        // Find video element
        this.video = this.element.querySelector('video, iframe');

        // Load saved progress
        await this.loadProgress();

        if (this.video) {
            this.setupVideoTracking();
        }

        // Setup completion tracking
        if (this.options.autoTrack) {
            this.setupCompletionTracking();
        }

        // Setup time tracking
        this.setupTimeTracking();
    }

    async loadProgress() {
        /**
         * Load saved video progress to resume from last position
         */
        if (!this.options.slideId) return;

        try {
            const result = await rpc('/elearning/video/progress/' + this.options.slideId, {});
            
            if (result.success && result.data) {
                const data = result.data;
                this.completed = data.is_completed;
                
                // Resume from saved position
                if (this.video && this.video.tagName === 'VIDEO' && data.current_position > 0) {
                    this.video.currentTime = data.current_position;
                }
                
                // Apply saved preferences
                if (data.playback_speed && this.video && this.video.tagName === 'VIDEO') {
                    this.video.playbackRate = data.playback_speed;
                }

                if (this.completed) {
                    this.updateUI();
                }
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    setupVideoTracking() {
        if (this.video.tagName === 'VIDEO') {
            this.video.addEventListener('play', () => {
                this.isPlaying = true;
                this.onVideoPlay();
            });

            this.video.addEventListener('pause', () => {
                this.isPlaying = false;
                this.onVideoPause();
            });

            this.video.addEventListener('ended', () => {
                this.isPlaying = false;
                this.onVideoComplete();
            });

            this.video.addEventListener('timeupdate', () => {
                this.onVideoProgress();
            });

            // Save on seek
            this.video.addEventListener('seeked', () => {
                this.saveProgress();
            });
        }
    }

    setupCompletionTracking() {
        // Mark complete button
        const completeBtn = this.element.querySelector('.btn-mark-complete');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                this.markComplete();
            });
        }
    }

    setupTimeTracking() {
        // Save progress periodically while playing
        setInterval(() => {
            if (this.isPlaying) {
                this.saveProgress();
            }
        }, this.options.saveInterval * 1000);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveProgress();
        });

        // Save when tab becomes hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveProgress();
            }
        });
    }

    onVideoPlay() {
        console.log('Video started playing');
    }

    onVideoPause() {
        console.log('Video paused');
        this.saveProgress();
    }

    onVideoComplete() {
        console.log('Video completed');
        this.saveProgress();
        this.markComplete();
    }

    onVideoProgress() {
        if (!this.video || this.video.tagName !== 'VIDEO') return;

        const currentTime = Math.floor(this.video.currentTime);
        const duration = Math.floor(this.video.duration);
        const progress = (currentTime / duration) * 100;

        // Update progress bar if exists
        const progressBar = this.element.querySelector('.video-progress-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        // Save progress every 10 seconds of video time
        if (currentTime - this.lastSavePosition >= 10) {
            this.lastSavePosition = currentTime;
            this.saveProgress();
        }
    }

    async saveProgress() {
        /**
         * Save current video position to server
         */
        if (!this.options.slideId || !this.video || this.video.tagName !== 'VIDEO') return;

        const currentTime = Math.floor(this.video.currentTime);
        const duration = Math.floor(this.video.duration);

        try {
            await rpc('/elearning/video/progress', {
                slide_id: this.options.slideId,
                position: currentTime,
                duration: duration,
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    async markComplete() {
        if (this.completed) return;

        try {
            // First save the final position
            await this.saveProgress();

            // Then mark the slide as complete in Odoo's system
            const response = await rpc('/slides/slide/set_completed', {
                slide_id: this.options.slideId,
            });

            if (response) {
                this.completed = true;
                this.showCompletionMessage();
                this.updateUI();
                
                // Dispatch event for other components
                document.dispatchEvent(new CustomEvent('lessonCompleted', {
                    detail: {
                        slideId: this.options.slideId,
                    }
                }));
            }
        } catch (error) {
            console.error('Error marking slide complete:', error);
        }
    }

    showCompletionMessage() {
        const message = document.createElement('div');
        message.className = 'completion-message';
        message.innerHTML = `
            <div class="completion-content">
                <i class="fa fa-check-circle"></i>
                <span>Lesson completed!</span>
            </div>
        `;
        this.element.appendChild(message);

        setTimeout(() => {
            message.classList.add('fade-out');
            setTimeout(() => message.remove(), 300);
        }, 2000);
    }

    updateUI() {
        // Update complete button
        const completeBtn = this.element.querySelector('.btn-mark-complete');
        if (completeBtn) {
            completeBtn.classList.add('completed');
            completeBtn.innerHTML = '<i class="fa fa-check"></i> Completed';
            completeBtn.disabled = true;
        }

        // Update sidebar item
        const sidebarItem = document.querySelector(`[data-slide-id="${this.options.slideId}"]`);
        if (sidebarItem) {
            sidebarItem.classList.add('completed');
        }
    }
}

// Initialize players
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.course-player').forEach(element => {
        new CoursePlayer(element, {
            enrollmentId: element.dataset.enrollmentId,
            slideId: element.dataset.slideId,
        });
    });
});

export default CoursePlayer;
