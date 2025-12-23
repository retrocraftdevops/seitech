# -*- coding: utf-8 -*-
"""Quiz/Survey controllers for e-learning."""
from odoo import http
from odoo.http import request


class QuizController(http.Controller):
    """Controllers for quiz functionality."""

    @http.route('/elearning/quiz/start/<int:slide_id>', type='http', auth='user', website=True)
    def start_quiz(self, slide_id, **kwargs):
        """Start a quiz for a lesson."""
        Slide = request.env['slide.slide'].sudo()
        slide = Slide.browse(slide_id)

        if not slide.exists() or not slide.survey_id:
            return request.redirect('/courses')

        # Check enrollment
        Enrollment = request.env['seitech.enrollment'].sudo()
        enrollment = Enrollment.search([
            ('channel_id', '=', slide.channel_id.id),
            ('user_id', '=', request.env.user.id),
            ('state', '=', 'active'),
        ], limit=1)

        if not enrollment:
            return request.redirect(f'/slides/{slide.channel_id.id}')

        # Check attempts remaining
        quiz_status = slide.check_quiz_completion(request.env.user.id)
        if quiz_status.get('attempts_remaining') == 0:
            return request.render('seitech_elearning.quiz_no_attempts', {
                'slide': slide,
                'quiz_status': quiz_status,
            })

        # Redirect to Odoo's survey start
        return request.redirect(f'/survey/start/{slide.survey_id.access_token}')

    @http.route('/elearning/quiz/status/<int:slide_id>', type='json', auth='user')
    def get_quiz_status(self, slide_id, **kwargs):
        """Get quiz status for current user."""
        Slide = request.env['slide.slide'].sudo()
        slide = Slide.browse(slide_id)

        if not slide.exists() or not slide.survey_id:
            return {'error': 'Quiz not found'}

        return slide.check_quiz_completion(request.env.user.id)

    @http.route('/elearning/quiz/result', type='http', auth='user', website=True)
    def quiz_result_callback(self, survey_id=None, answer_token=None, **kwargs):
        """Callback after quiz completion to award points."""
        if not survey_id or not answer_token:
            return request.redirect('/my/learning')

        Survey = request.env['survey.survey'].sudo()
        UserInput = request.env['survey.user_input'].sudo()

        survey = Survey.search([('access_token', '=', survey_id)], limit=1)
        if not survey:
            return request.redirect('/my/learning')

        # Find the user input
        user_input = UserInput.search([
            ('access_token', '=', answer_token),
            ('survey_id', '=', survey.id),
            ('state', '=', 'done'),
        ], limit=1)

        if not user_input:
            return request.redirect('/my/learning')

        # Find the associated slide
        Slide = request.env['slide.slide'].sudo()
        slide = Slide.search([('survey_id', '=', survey.id)], limit=1)

        if slide:
            # Check if passed
            passing_score = slide.quiz_passing_score
            score = user_input.scoring_percentage or 0

            if score >= passing_score:
                # Award gamification points
                slide._handle_quiz_passed(request.env.user.id, score)

                # Mark slide as completed if quiz requirement
                if slide.completion_requirement == 'quiz':
                    slide._action_set_completed(request.env.user.partner_id)

            # Redirect back to course player with result message
            return request.redirect(
                f'/slides/{slide.channel_id.id}/{slide.id}?quiz_score={score}&passed={score >= passing_score}'
            )

        return request.redirect('/my/learning')


class SurveyExtension(http.Controller):
    """Extend survey controllers for e-learning integration."""

    @http.route('/survey/<string:survey_token>/submit', type='json', auth='public', website=True)
    def survey_submit_hook(self, survey_token, **post):
        """Hook into survey submission for e-learning processing.
        
        Note: This catches the survey submission to process quiz results.
        The actual submission is handled by Odoo's survey module.
        """
        # This is a listener - actual processing happens in quiz_result_callback
        # when the survey is completed and the user is redirected
        pass
