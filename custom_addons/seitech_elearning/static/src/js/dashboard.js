/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

/**
 * E-Learning Dashboard Component
 * Displays key metrics and quick actions for e-learning management
 */
class ElearningDashboard extends Component {
    static template = "seitech_elearning.Dashboard";

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");

        this.state = useState({
            stats: {
                totalCourses: 0,
                totalEnrollments: 0,
                activeEnrollments: 0,
                totalCertificates: 0,
                totalRevenue: 0,
            },
            recentEnrollments: [],
            topCourses: [],
            loading: true,
        });

        onWillStart(async () => {
            await this.loadDashboardData();
        });
    }

    async loadDashboardData() {
        try {
            // Load stats
            const [courses, enrollments, certificates] = await Promise.all([
                this.orm.searchCount("slide.channel", [["is_published", "=", true]]),
                this.orm.searchRead(
                    "seitech.enrollment",
                    [],
                    ["id", "state", "amount_paid"],
                    { limit: 1000 }
                ),
                this.orm.searchCount("seitech.certificate", [["state", "=", "issued"]]),
            ]);

            const activeEnrollments = enrollments.filter(e => e.state === "active").length;
            const totalRevenue = enrollments
                .filter(e => e.state !== "cancelled")
                .reduce((sum, e) => sum + (e.amount_paid || 0), 0);

            this.state.stats = {
                totalCourses: courses,
                totalEnrollments: enrollments.length,
                activeEnrollments: activeEnrollments,
                totalCertificates: certificates,
                totalRevenue: totalRevenue,
            };

            // Load recent enrollments
            this.state.recentEnrollments = await this.orm.searchRead(
                "seitech.enrollment",
                [["state", "=", "active"]],
                ["name", "channel_id", "user_id", "enrollment_date", "completion_percentage"],
                { order: "enrollment_date desc", limit: 5 }
            );

            // Load top courses
            this.state.topCourses = await this.orm.searchRead(
                "slide.channel",
                [["is_published", "=", true]],
                ["name", "enrollment_count", "total_votes"],
                { order: "enrollment_count desc", limit: 5 }
            );

            this.state.loading = false;
        } catch (error) {
            console.error("Error loading dashboard data:", error);
            this.state.loading = false;
        }
    }

    openEnrollments() {
        this.action.doAction("seitech_elearning.action_enrollment");
    }

    openCertificates() {
        this.action.doAction("seitech_elearning.action_certificate");
    }

    openCourses() {
        this.action.doAction("website_slides.slide_channel_action_overview");
    }

    openInstructors() {
        this.action.doAction("seitech_elearning.action_instructor");
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount);
    }
}

ElearningDashboard.template = "seitech_elearning.Dashboard";

registry.category("actions").add("seitech_elearning_dashboard", ElearningDashboard);

export default ElearningDashboard;
