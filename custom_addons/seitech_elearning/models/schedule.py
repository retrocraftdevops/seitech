# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import timedelta


class Schedule(models.Model):
    """Live class scheduling for courses."""
    _name = 'seitech.schedule'
    _description = 'Live Class Schedule'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'start_datetime'

    name = fields.Char(string='Title', required=True)
    channel_id = fields.Many2one(
        'slide.channel',
        string='Course',
        required=True,
        ondelete='cascade',
    )
    slide_id = fields.Many2one(
        'slide.slide',
        string='Related Lesson',
        ondelete='set null',
    )
    instructor_id = fields.Many2one(
        'seitech.instructor',
        string='Instructor',
        required=True,
    )

    # Schedule
    start_datetime = fields.Datetime(
        string='Start Time',
        required=True,
    )
    end_datetime = fields.Datetime(
        string='End Time',
        required=True,
    )
    duration = fields.Float(
        string='Duration (hours)',
        compute='_compute_duration',
        store=True,
    )
    timezone = fields.Selection(
        '_tz_get',
        string='Timezone',
        default=lambda self: self.env.user.tz or 'UTC',
    )

    # Recurrence
    is_recurring = fields.Boolean(string='Recurring', default=False)
    recurrence_type = fields.Selection([
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ], string='Recurrence')
    recurrence_count = fields.Integer(
        string='Number of Occurrences',
        default=1,
    )
    recurrence_end_date = fields.Date(string='Recurrence End Date')

    # Meeting details
    meeting_type = fields.Selection([
        ('zoom', 'Zoom'),
        ('teams', 'Microsoft Teams'),
        ('meet', 'Google Meet'),
        ('jitsi', 'Jitsi'),
        ('custom', 'Custom URL'),
        ('in_person', 'In Person'),
    ], string='Meeting Type', default='zoom')
    meeting_url = fields.Char(string='Meeting URL')
    meeting_id = fields.Char(string='Meeting ID')
    meeting_password = fields.Char(string='Meeting Password')
    location = fields.Char(string='Location')
    description = fields.Html(string='Description')

    # Capacity
    max_attendees = fields.Integer(
        string='Max Attendees',
        default=0,
        help='0 = unlimited',
    )
    registration_required = fields.Boolean(
        string='Registration Required',
        default=True,
    )
    registration_deadline = fields.Datetime(string='Registration Deadline')

    # Attendees
    attendee_ids = fields.One2many(
        'seitech.schedule.attendee',
        'schedule_id',
        string='Attendees',
    )
    attendee_count = fields.Integer(
        string='Registered',
        compute='_compute_attendee_count',
        store=True,
    )
    actual_attendee_count = fields.Integer(
        string='Attended',
        compute='_compute_attendee_count',
        store=True,
    )

    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', tracking=True)

    # Recording
    has_recording = fields.Boolean(string='Has Recording', default=False)
    recording_url = fields.Char(string='Recording URL')
    recording_attachment_id = fields.Many2one(
        'ir.attachment',
        string='Recording File',
    )

    # Notifications
    send_reminder = fields.Boolean(string='Send Reminders', default=True)
    reminder_time = fields.Integer(
        string='Reminder (hours before)',
        default=24,
    )

    # Calendar integration
    calendar_event_id = fields.Many2one(
        'calendar.event',
        string='Calendar Event',
    )

    @api.model
    def _tz_get(self):
        return [(x, x) for x in sorted(
            set(fields.Datetime.now().tzinfo.zone if fields.Datetime.now().tzinfo else ['UTC'])
        )]

    @api.depends('start_datetime', 'end_datetime')
    def _compute_duration(self):
        for schedule in self:
            if schedule.start_datetime and schedule.end_datetime:
                delta = schedule.end_datetime - schedule.start_datetime
                schedule.duration = delta.total_seconds() / 3600
            else:
                schedule.duration = 0

    @api.depends('attendee_ids', 'attendee_ids.state')
    def _compute_attendee_count(self):
        for schedule in self:
            attendees = schedule.attendee_ids
            schedule.attendee_count = len(attendees.filtered(
                lambda a: a.state in ('registered', 'attended')
            ))
            schedule.actual_attendee_count = len(attendees.filtered(
                lambda a: a.state == 'attended'
            ))

    @api.constrains('start_datetime', 'end_datetime')
    def _check_dates(self):
        for schedule in self:
            if schedule.start_datetime >= schedule.end_datetime:
                raise ValidationError(
                    _('End time must be after start time.')
                )

    def action_schedule(self):
        """Schedule the class."""
        for schedule in self:
            schedule.state = 'scheduled'
            schedule._create_calendar_event()
        return True

    def action_start(self):
        """Mark class as in progress."""
        self.write({'state': 'in_progress'})

    def action_complete(self):
        """Mark class as completed."""
        self.write({'state': 'completed'})

    def action_cancel(self):
        """Cancel the class."""
        for schedule in self:
            schedule.state = 'cancelled'
            # Notify attendees
            schedule._notify_cancellation()
        return True

    def _create_calendar_event(self):
        """Create calendar event for the schedule."""
        self.ensure_one()
        if self.calendar_event_id:
            return

        event = self.env['calendar.event'].create({
            'name': f'[Live Class] {self.name}',
            'start': self.start_datetime,
            'stop': self.end_datetime,
            'description': self.description or '',
            'location': self.location or self.meeting_url,
            'user_id': self.instructor_id.user_id.id if self.instructor_id.user_id else self.env.user.id,
        })
        self.calendar_event_id = event.id

    def _notify_cancellation(self):
        """Send cancellation notification to attendees."""
        template = self.env.ref(
            'seitech_elearning.schedule_cancelled_email',
            raise_if_not_found=False
        )
        if template:
            for attendee in self.attendee_ids.filtered(lambda a: a.state == 'registered'):
                template.send_mail(attendee.id, force_send=False)

    @api.model
    def _cron_send_reminders(self):
        """Send reminders for upcoming classes."""
        now = fields.Datetime.now()
        schedules = self.search([
            ('state', '=', 'scheduled'),
            ('send_reminder', '=', True),
        ])
        for schedule in schedules:
            reminder_time = now + timedelta(hours=schedule.reminder_time)
            if schedule.start_datetime <= reminder_time:
                schedule._send_reminder_emails()

    def _send_reminder_emails(self):
        """Send reminder emails to attendees."""
        template = self.env.ref(
            'seitech_elearning.schedule_reminder_email',
            raise_if_not_found=False
        )
        if template:
            for attendee in self.attendee_ids.filtered(lambda a: a.state == 'registered'):
                template.send_mail(attendee.id, force_send=False)

    def action_view_attendees(self):
        """View attendees for this schedule."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Attendees - {self.name}',
            'res_model': 'seitech.schedule.attendee',
            'view_mode': 'list,form',
            'domain': [('schedule_id', '=', self.id)],
            'context': {'default_schedule_id': self.id},
        }


class ScheduleAttendee(models.Model):
    """Attendees for scheduled live classes."""
    _name = 'seitech.schedule.attendee'
    _description = 'Schedule Attendee'
    _order = 'create_date'

    schedule_id = fields.Many2one(
        'seitech.schedule',
        string='Schedule',
        required=True,
        ondelete='cascade',
    )
    user_id = fields.Many2one(
        'res.users',
        string='Attendee',
        required=True,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Contact',
        related='user_id.partner_id',
        store=True,
    )
    enrollment_id = fields.Many2one(
        'seitech.enrollment',
        string='Enrollment',
    )

    state = fields.Selection([
        ('registered', 'Registered'),
        ('attended', 'Attended'),
        ('absent', 'Absent'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='registered')

    registration_date = fields.Datetime(
        string='Registration Date',
        default=fields.Datetime.now,
    )
    attendance_time = fields.Datetime(string='Attended At')
    notes = fields.Text(string='Notes')

    _sql_constraints = [
        ('unique_attendee', 'UNIQUE(schedule_id, user_id)',
         'User is already registered for this session.'),
    ]

    def action_mark_attended(self):
        """Mark attendee as present."""
        for attendee in self:
            attendee.state = 'attended'
            attendee.attendance_time = fields.Datetime.now()
        return True

    def action_mark_absent(self):
        """Mark attendee as absent."""
        self.write({'state': 'absent'})

    def action_cancel(self):
        """Cancel registration."""
        self.write({'state': 'cancelled'})
