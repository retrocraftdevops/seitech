# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class Assignment(models.Model):
    """Course assignments for students."""
    _name = 'seitech.assignment'
    _description = 'Course Assignment'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'deadline, name'

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
    sequence = fields.Integer(string='Sequence', default=10)

    # Content
    description = fields.Html(string='Instructions', required=True)
    attachment_ids = fields.Many2many(
        'ir.attachment',
        'assignment_attachment_rel',
        'assignment_id',
        'attachment_id',
        string='Reference Files',
    )

    # Grading
    points = fields.Float(string='Maximum Points', default=100)
    passing_score = fields.Float(string='Passing Score', default=50)
    grading_type = fields.Selection([
        ('points', 'Points'),
        ('percentage', 'Percentage'),
        ('pass_fail', 'Pass/Fail'),
        ('letter', 'Letter Grade'),
    ], string='Grading Type', default='points')
    rubric = fields.Html(string='Grading Rubric')

    # Deadlines
    available_date = fields.Datetime(string='Available From')
    deadline = fields.Datetime(string='Due Date')
    late_deadline = fields.Datetime(
        string='Late Submission Deadline',
        help='Allow late submissions until this date',
    )
    late_penalty = fields.Float(
        string='Late Penalty (%)',
        default=10,
        help='Percentage deducted for late submissions',
    )

    # Submission settings
    submission_type = fields.Selection([
        ('file', 'File Upload'),
        ('text', 'Text Entry'),
        ('url', 'Website URL'),
        ('any', 'Any Type'),
    ], string='Submission Type', default='file', required=True)
    allowed_file_types = fields.Char(
        string='Allowed File Types',
        default='pdf,doc,docx,txt,zip',
        help='Comma-separated list of extensions',
    )
    max_file_size = fields.Integer(
        string='Max File Size (MB)',
        default=10,
    )
    max_submissions = fields.Integer(
        string='Max Submissions',
        default=1,
        help='0 = unlimited resubmissions',
    )

    # Visibility
    is_published = fields.Boolean(string='Published', default=False)
    is_group_assignment = fields.Boolean(
        string='Group Assignment',
        default=False,
    )
    group_size = fields.Integer(string='Group Size', default=2)

    # Submissions
    submission_ids = fields.One2many(
        'seitech.assignment.submission',
        'assignment_id',
        string='Submissions',
    )
    submission_count = fields.Integer(
        string='Submissions',
        compute='_compute_submission_count',
        store=True,
    )
    graded_count = fields.Integer(
        string='Graded',
        compute='_compute_submission_count',
        store=True,
    )

    # Instructor
    instructor_id = fields.Many2one(
        'seitech.instructor',
        string='Assigned Instructor',
    )

    @api.depends('submission_ids', 'submission_ids.state')
    def _compute_submission_count(self):
        for assignment in self:
            submissions = assignment.submission_ids
            assignment.submission_count = len(submissions)
            assignment.graded_count = len(submissions.filtered(
                lambda s: s.state == 'graded'
            ))

    @api.constrains('deadline', 'late_deadline')
    def _check_deadlines(self):
        for assignment in self:
            if assignment.deadline and assignment.late_deadline:
                if assignment.late_deadline < assignment.deadline:
                    raise ValidationError(
                        _('Late submission deadline must be after the regular deadline.')
                    )

    @api.constrains('passing_score', 'points')
    def _check_passing_score(self):
        for assignment in self:
            if assignment.passing_score > assignment.points:
                raise ValidationError(
                    _('Passing score cannot exceed maximum points.')
                )

    def action_view_submissions(self):
        """View all submissions for this assignment."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Submissions - {self.name}',
            'res_model': 'seitech.assignment.submission',
            'view_mode': 'list,form',
            'domain': [('assignment_id', '=', self.id)],
            'context': {'default_assignment_id': self.id},
        }

    def action_publish(self):
        """Publish the assignment."""
        self.write({'is_published': True})

    def action_unpublish(self):
        """Unpublish the assignment."""
        self.write({'is_published': False})


class AssignmentSubmission(models.Model):
    """Student submissions for assignments."""
    _name = 'seitech.assignment.submission'
    _description = 'Assignment Submission'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'submit_date desc'

    name = fields.Char(
        string='Reference',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: _('New'),
    )
    assignment_id = fields.Many2one(
        'seitech.assignment',
        string='Assignment',
        required=True,
        ondelete='cascade',
    )
    channel_id = fields.Many2one(
        'slide.channel',
        string='Course',
        related='assignment_id.channel_id',
        store=True,
    )
    user_id = fields.Many2one(
        'res.users',
        string='Student',
        required=True,
        default=lambda self: self.env.user,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Contact',
        related='user_id.partner_id',
        store=True,
    )

    # Submission content
    submission_type = fields.Selection([
        ('file', 'File Upload'),
        ('text', 'Text Entry'),
        ('url', 'Website URL'),
    ], string='Submission Type', required=True)
    text_content = fields.Html(string='Text Content')
    url_content = fields.Char(string='URL')
    attachment_ids = fields.Many2many(
        'ir.attachment',
        'submission_attachment_rel',
        'submission_id',
        'attachment_id',
        string='Files',
    )

    # Timestamps
    submit_date = fields.Datetime(
        string='Submitted',
        default=fields.Datetime.now,
    )
    is_late = fields.Boolean(
        string='Late Submission',
        compute='_compute_is_late',
        store=True,
    )

    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('graded', 'Graded'),
        ('resubmit', 'Resubmission Required'),
    ], string='Status', default='draft', tracking=True)

    # Grading
    score = fields.Float(string='Score')
    adjusted_score = fields.Float(
        string='Adjusted Score',
        compute='_compute_adjusted_score',
        store=True,
    )
    letter_grade = fields.Char(string='Letter Grade')
    is_passing = fields.Boolean(
        string='Passing',
        compute='_compute_is_passing',
        store=True,
    )
    feedback = fields.Html(string='Instructor Feedback')
    graded_by_id = fields.Many2one('res.users', string='Graded By')
    graded_date = fields.Datetime(string='Graded Date')

    # Attempt tracking
    attempt_number = fields.Integer(string='Attempt #', default=1)

    # Comments
    student_comment = fields.Text(string='Student Comment')

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code(
                    'seitech.assignment.submission'
                ) or _('New')
            # Calculate attempt number
            if vals.get('assignment_id') and vals.get('user_id'):
                existing = self.search_count([
                    ('assignment_id', '=', vals['assignment_id']),
                    ('user_id', '=', vals['user_id']),
                ])
                vals['attempt_number'] = existing + 1
        return super().create(vals_list)

    @api.depends('submit_date', 'assignment_id.deadline')
    def _compute_is_late(self):
        for submission in self:
            deadline = submission.assignment_id.deadline
            if deadline and submission.submit_date:
                submission.is_late = submission.submit_date > deadline
            else:
                submission.is_late = False

    @api.depends('score', 'is_late', 'assignment_id.late_penalty')
    def _compute_adjusted_score(self):
        for submission in self:
            if submission.score:
                if submission.is_late and submission.assignment_id.late_penalty:
                    penalty = submission.score * (submission.assignment_id.late_penalty / 100)
                    submission.adjusted_score = submission.score - penalty
                else:
                    submission.adjusted_score = submission.score
            else:
                submission.adjusted_score = 0

    @api.depends('adjusted_score', 'assignment_id.passing_score')
    def _compute_is_passing(self):
        for submission in self:
            passing = submission.assignment_id.passing_score
            submission.is_passing = submission.adjusted_score >= passing

    def action_submit(self):
        """Submit the assignment."""
        for submission in self:
            if submission.state == 'draft':
                submission.state = 'submitted'
                submission.submit_date = fields.Datetime.now()
        return True

    def action_start_review(self):
        """Start reviewing the submission."""
        self.write({'state': 'under_review'})

    def action_grade(self):
        """Grade the submission (opens grading wizard)."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Grade Submission',
            'res_model': 'seitech.assignment.submission',
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'current',
            'context': {'grading_mode': True},
        }

    def action_request_resubmit(self):
        """Request resubmission from student."""
        for submission in self:
            submission.state = 'resubmit'
            # Send notification to student
            # self._send_resubmit_notification()
        return True

    def action_finalize_grade(self):
        """Finalize the grading."""
        for submission in self:
            submission.state = 'graded'
            submission.graded_by_id = self.env.user.id
            submission.graded_date = fields.Datetime.now()
