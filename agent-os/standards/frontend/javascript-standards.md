# Odoo JavaScript Standards

Standards for JavaScript development in Odoo modules.

## File Structure

```
static/
└── src/
    ├── js/
    │   ├── components/           # OWL components
    │   │   ├── course_player.js
    │   │   └── quiz_widget.js
    │   ├── services/             # Services
    │   │   └── enrollment_service.js
    │   ├── views/                # View customizations
    │   │   └── form_view_ext.js
    │   └── main.js               # Main entry point
    └── xml/
        └── templates.xml         # OWL templates
```

## OWL Component Pattern

```javascript
/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";

export class CoursePlayer extends Component {
    static template = "seitech_elearning.CoursePlayer";
    static props = {
        courseId: { type: Number },
        autoPlay: { type: Boolean, optional: true },
    };
    static defaultProps = {
        autoPlay: false,
    };

    setup() {
        // Services
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.rpc = useService("rpc");

        // State
        this.state = useState({
            course: null,
            currentLesson: null,
            progress: 0,
            isPlaying: false,
            loading: true,
        });

        // Lifecycle hooks
        onWillStart(async () => {
            await this.loadCourse();
        });
    }

    async loadCourse() {
        try {
            this.state.loading = true;
            const course = await this.orm.read(
                "slide.channel",
                [this.props.courseId],
                ["name", "slide_ids", "total_time"]
            );
            this.state.course = course[0];
            this.state.loading = false;
        } catch (error) {
            this.notification.add(
                "Failed to load course",
                { type: "danger" }
            );
            console.error(error);
        }
    }

    async updateProgress(lessonId, progress) {
        await this.rpc("/api/course/progress", {
            lesson_id: lessonId,
            progress: progress,
        });
        this.state.progress = progress;
    }

    onPlayClick() {
        this.state.isPlaying = !this.state.isPlaying;
    }

    get formattedTime() {
        const time = this.state.course?.total_time || 0;
        const hours = Math.floor(time);
        const minutes = Math.round((time - hours) * 60);
        return `${hours}h ${minutes}m`;
    }
}

// Register component
registry.category("public_components").add("CoursePlayer", CoursePlayer);
```

## OWL Template (XML)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">

    <t t-name="seitech_elearning.CoursePlayer">
        <div class="course-player" t-att-class="{ 'loading': state.loading }">
            <t t-if="state.loading">
                <div class="loading-spinner">
                    <i class="fa fa-spinner fa-spin fa-3x"/>
                </div>
            </t>
            <t t-else="">
                <div class="player-header">
                    <h2 t-esc="state.course.name"/>
                    <span class="duration">
                        <i class="fa fa-clock-o"/> <t t-esc="formattedTime"/>
                    </span>
                </div>

                <div class="player-content">
                    <div class="video-container">
                        <video t-ref="videoPlayer"
                               t-on-timeupdate="onTimeUpdate"
                               t-on-ended="onVideoEnd">
                            <source t-att-src="videoUrl" type="video/mp4"/>
                        </video>
                    </div>

                    <div class="player-controls">
                        <button class="btn btn-primary"
                                t-on-click="onPlayClick">
                            <i t-att-class="state.isPlaying ? 'fa fa-pause' : 'fa fa-play'"/>
                            <t t-esc="state.isPlaying ? 'Pause' : 'Play'"/>
                        </button>

                        <div class="progress-bar">
                            <div class="progress-fill"
                                 t-attf-style="width: {{ state.progress }}%"/>
                        </div>
                        <span class="progress-text">
                            <t t-esc="state.progress"/>%
                        </span>
                    </div>
                </div>

                <div class="lesson-list">
                    <t t-foreach="lessons" t-as="lesson" t-key="lesson.id">
                        <div t-att-class="getLessonClass(lesson)"
                             t-on-click="() => this.selectLesson(lesson)">
                            <i t-att-class="getLessonIcon(lesson)"/>
                            <span t-esc="lesson.name"/>
                            <span class="duration" t-esc="lesson.duration"/>
                        </div>
                    </t>
                </div>
            </t>
        </div>
    </t>

</templates>
```

## Service Pattern

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";

export const enrollmentService = {
    dependencies: ["rpc", "notification"],

    start(env, { rpc, notification }) {
        return {
            async enroll(courseId) {
                try {
                    const result = await rpc("/api/course/enroll", {
                        course_id: courseId,
                    });
                    notification.add("Successfully enrolled!", { type: "success" });
                    return result;
                } catch (error) {
                    notification.add("Enrollment failed", { type: "danger" });
                    throw error;
                }
            },

            async unenroll(enrollmentId) {
                return await rpc("/api/course/unenroll", {
                    enrollment_id: enrollmentId,
                });
            },

            async getProgress(courseId) {
                return await rpc("/api/course/progress/get", {
                    course_id: courseId,
                });
            },
        };
    },
};

registry.category("services").add("enrollment", enrollmentService);
```

## Form Widget Extension

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { Component, useState } from "@odoo/owl";

export class ProgressField extends Component {
    static template = "seitech_elearning.ProgressField";
    static props = {
        ...standardFieldProps,
    };

    setup() {
        this.state = useState({
            showDetails: false,
        });
    }

    get percentage() {
        return Math.round(this.props.record.data[this.props.name] || 0);
    }

    get progressClass() {
        const pct = this.percentage;
        if (pct >= 100) return "bg-success";
        if (pct >= 50) return "bg-warning";
        return "bg-danger";
    }

    toggleDetails() {
        this.state.showDetails = !this.state.showDetails;
    }
}

ProgressField.template = xml`
    <div class="progress-field" t-on-click="toggleDetails">
        <div class="progress" style="height: 20px;">
            <div class="progress-bar"
                 t-att-class="progressClass"
                 t-attf-style="width: {{ percentage }}%">
                <span t-esc="percentage"/>%
            </div>
        </div>
        <t t-if="state.showDetails">
            <div class="progress-details mt-2">
                <small class="text-muted">
                    Click to update progress
                </small>
            </div>
        </t>
    </div>
`;

registry.category("fields").add("progress", {
    component: ProgressField,
    supportedTypes: ["float", "integer"],
});
```

## RPC Calls

```javascript
// Using orm service (recommended for model operations)
const records = await this.orm.searchRead(
    "slide.channel",
    [["is_published", "=", true]],
    ["id", "name", "description"],
    { limit: 10, order: "create_date desc" }
);

// Using rpc service (for custom controllers)
const result = await this.rpc("/api/custom/endpoint", {
    param1: "value1",
    param2: 123,
});

// Error handling
try {
    const data = await this.orm.call(
        "slide.channel",
        "custom_method",
        [recordId],
        { context: { key: "value" } }
    );
} catch (error) {
    if (error.data?.name === "odoo.exceptions.AccessError") {
        this.notification.add("Access denied", { type: "warning" });
    } else {
        throw error;
    }
}
```

## Event Handling

```javascript
// DOM events
onButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();
    // Handle click
}

// Custom events
onCustomEvent(event) {
    const { detail } = event;
    console.log("Received:", detail);
}

// Keyboard events
onKeyDown(event) {
    if (event.key === "Escape") {
        this.close();
    }
    if (event.key === "Enter" && event.ctrlKey) {
        this.submit();
    }
}
```

## Asset Registration

```python
# __manifest__.py
{
    'assets': {
        # Backend assets
        'web.assets_backend': [
            'seitech_elearning/static/src/js/**/*',
            'seitech_elearning/static/src/xml/**/*',
            'seitech_elearning/static/src/scss/backend/**/*',
        ],
        # Frontend assets
        'web.assets_frontend': [
            'seitech_elearning/static/src/js/frontend/**/*',
            'seitech_elearning/static/src/scss/frontend/**/*',
        ],
        # Specific bundle
        'seitech_elearning.player_assets': [
            'seitech_elearning/static/src/js/player/**/*',
        ],
    },
}
```

## Best Practices

1. **Use @odoo-module**: Always declare module header
2. **Use services**: Don't access `this.env.services` directly
3. **State management**: Use `useState` for reactive state
4. **Error handling**: Always handle RPC errors gracefully
5. **Translations**: Use `_t()` for user-facing strings
6. **Performance**: Lazy load heavy components
7. **Testing**: Write unit tests for complex logic
8. **Documentation**: JSDoc for public methods

## Common Imports

```javascript
/** @odoo-module **/

// Core
import { Component, useState, useRef, onWillStart, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";

// Fields
import { standardFieldProps } from "@web/views/fields/standard_field_props";

// Dialog
import { Dialog } from "@web/core/dialog/dialog";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";

// Utils
import { debounce } from "@web/core/utils/timing";
import { formatDate, parseDate } from "@web/core/l10n/dates";
import { formatMonetary } from "@web/views/fields/formatters";
```
