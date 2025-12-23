# -*- coding: utf-8 -*-
import json
from datetime import datetime
from odoo import http
from odoo.http import request


class ScheduleApiController(http.Controller):
    """REST API for training schedules - consumed by Next.js frontend."""

    def _json_response(self, data, status=200):
        """Return a JSON response."""
        return request.make_response(
            json.dumps(data, default=str),
            headers=[
                ('Content-Type', 'application/json'),
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
                ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
            ],
            status=status
        )

    def _get_schedule_data(self, schedule, full=False):
        """Format schedule data for API response."""
        # Compute available spots
        max_attendees = schedule.max_attendees or 0
        attendee_count = schedule.attendee_count or 0
        available_spots = -1 if max_attendees == 0 else max(0, max_attendees - attendee_count)

        data = {
            'id': schedule.id,
            'name': schedule.name,
            'courseName': schedule.channel_id.name if schedule.channel_id else '',
            'courseId': schedule.channel_id.id if schedule.channel_id else None,
            'courseSlug': schedule.channel_id.seo_name or str(schedule.channel_id.id) if schedule.channel_id else None,
            'instructorName': schedule.instructor_id.name if schedule.instructor_id else '',
            'instructorId': schedule.instructor_id.id if schedule.instructor_id else None,
            'instructorImageUrl': f'/web/image/seitech.instructor/{schedule.instructor_id.id}/image' if schedule.instructor_id and schedule.instructor_id.image else None,
            'startDatetime': schedule.start_datetime.isoformat() if schedule.start_datetime else None,
            'endDatetime': schedule.end_datetime.isoformat() if schedule.end_datetime else None,
            'duration': schedule.duration or 0,
            'timezone': schedule.timezone or 'Europe/London',
            'meetingType': schedule.meeting_type or 'in_person',
            'location': schedule.location or '',
            'maxAttendees': max_attendees,
            'attendeeCount': attendee_count,
            'availableSpots': available_spots,
            'registrationRequired': schedule.registration_required,
            'registrationDeadline': schedule.registration_deadline.isoformat() if schedule.registration_deadline else None,
            'state': schedule.state or 'draft',
        }

        if full:
            data.update({
                'course': {
                    'id': schedule.channel_id.id,
                    'name': schedule.channel_id.name,
                    'slug': schedule.channel_id.seo_name or str(schedule.channel_id.id),
                    'thumbnailUrl': f'/web/image/slide.channel/{schedule.channel_id.id}/image_512' if schedule.channel_id and schedule.channel_id.image_512 else None,
                } if schedule.channel_id else None,
                'instructor': {
                    'id': schedule.instructor_id.id,
                    'name': schedule.instructor_id.name,
                    'title': schedule.instructor_id.title or '',
                    'shortBio': schedule.instructor_id.short_bio or '',
                    'imageUrl': f'/web/image/seitech.instructor/{schedule.instructor_id.id}/image' if schedule.instructor_id and schedule.instructor_id.image else None,
                } if schedule.instructor_id else None,
                'description': schedule.description or '',
                'meetingUrl': schedule.meeting_url or '',
                'meetingId': schedule.meeting_id or '',
                'hasRecording': schedule.has_recording,
                'recordingUrl': schedule.recording_url if schedule.has_recording else None,
                'createdAt': schedule.create_date.isoformat() if schedule.create_date else None,
                'updatedAt': schedule.write_date.isoformat() if schedule.write_date else None,
            })

        return data

    @http.route('/api/schedules', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def get_schedules(self, **kwargs):
        """
        Get list of upcoming schedules with filtering and pagination.

        Query params:
            - page: Page number (default: 1)
            - limit: Items per page (default: 12)
            - courseId: Filter by course ID
            - instructorId: Filter by instructor ID
            - meetingType: Filter by meeting type
            - startDate: Filter by start date (ISO format)
            - endDate: Filter by end date (ISO format)
            - state: Filter by state (default: scheduled)
            - upcoming: Only show future schedules (default: true)
        """
        try:
            Schedule = request.env['seitech.schedule'].sudo()
            now = datetime.utcnow()

            # Build domain
            domain = []

            # Default to scheduled and upcoming
            state = kwargs.get('state', 'scheduled')
            if state:
                domain.append(('state', '=', state))

            upcoming = kwargs.get('upcoming', 'true').lower() == 'true'
            if upcoming:
                domain.append(('start_datetime', '>', now))

            # Course filter
            if kwargs.get('courseId'):
                try:
                    domain.append(('channel_id', '=', int(kwargs['courseId'])))
                except ValueError:
                    pass

            # Instructor filter
            if kwargs.get('instructorId'):
                try:
                    domain.append(('instructor_id', '=', int(kwargs['instructorId'])))
                except ValueError:
                    pass

            # Meeting type filter
            if kwargs.get('meetingType'):
                domain.append(('meeting_type', '=', kwargs['meetingType']))

            # Date range filter
            if kwargs.get('startDate'):
                try:
                    start = datetime.fromisoformat(kwargs['startDate'].replace('Z', '+00:00'))
                    domain.append(('start_datetime', '>=', start))
                except ValueError:
                    pass

            if kwargs.get('endDate'):
                try:
                    end = datetime.fromisoformat(kwargs['endDate'].replace('Z', '+00:00'))
                    domain.append(('start_datetime', '<=', end))
                except ValueError:
                    pass

            # Pagination
            page = int(kwargs.get('page', 1))
            limit = min(int(kwargs.get('limit', 12)), 100)
            offset = (page - 1) * limit

            # Get total count
            total = Schedule.search_count(domain)

            # Get schedules ordered by start time
            schedules = Schedule.search(domain, offset=offset, limit=limit, order='start_datetime asc')

            return self._json_response({
                'success': True,
                'data': {
                    'schedules': [self._get_schedule_data(s) for s in schedules],
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total,
                        'totalPages': (total + limit - 1) // limit if limit > 0 else 0,
                    },
                },
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)

    @http.route('/api/schedules/upcoming', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def get_upcoming_schedules(self, **kwargs):
        """Get upcoming schedules for homepage display."""
        try:
            Schedule = request.env['seitech.schedule'].sudo()
            now = datetime.utcnow()
            limit = int(kwargs.get('limit', 6))

            schedules = Schedule.search([
                ('state', '=', 'scheduled'),
                ('start_datetime', '>', now),
            ], limit=limit, order='start_datetime asc')

            return self._json_response({
                'success': True,
                'data': [self._get_schedule_data(s) for s in schedules],
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)

    @http.route('/api/schedules/<int:schedule_id>', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def get_schedule_detail(self, schedule_id, **kwargs):
        """Get single schedule details."""
        try:
            Schedule = request.env['seitech.schedule'].sudo()
            schedule = Schedule.browse(schedule_id)

            if not schedule.exists():
                return self._json_response({
                    'success': False,
                    'message': 'Schedule not found',
                    'data': None,
                }, status=404)

            return self._json_response({
                'success': True,
                'data': self._get_schedule_data(schedule, full=True),
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)

    @http.route('/api/schedules/<int:schedule_id>/register', type='http', auth='user', methods=['POST', 'OPTIONS'], csrf=False, cors='*')
    def register_for_schedule(self, schedule_id, **kwargs):
        """Register current user for a schedule."""
        try:
            Schedule = request.env['seitech.schedule'].sudo()
            Attendee = request.env['seitech.schedule.attendee'].sudo()
            schedule = Schedule.browse(schedule_id)

            if not schedule.exists():
                return self._json_response({
                    'success': False,
                    'message': 'Schedule not found',
                }, status=404)

            if schedule.state != 'scheduled':
                return self._json_response({
                    'success': False,
                    'message': 'Registration is not available for this session',
                }, status=400)

            # Check capacity
            if schedule.max_attendees > 0 and schedule.attendee_count >= schedule.max_attendees:
                return self._json_response({
                    'success': False,
                    'message': 'This session is fully booked',
                }, status=400)

            # Check deadline
            if schedule.registration_deadline:
                now = datetime.utcnow()
                if now > schedule.registration_deadline:
                    return self._json_response({
                        'success': False,
                        'message': 'Registration deadline has passed',
                    }, status=400)

            # Check if already registered
            existing = Attendee.search([
                ('schedule_id', '=', schedule_id),
                ('user_id', '=', request.env.user.id),
                ('state', 'in', ('registered', 'attended')),
            ], limit=1)

            if existing:
                return self._json_response({
                    'success': False,
                    'message': 'You are already registered for this session',
                }, status=400)

            # Parse request body for notes
            notes = ''
            try:
                body = json.loads(request.httprequest.data or '{}')
                notes = body.get('notes', '')
            except json.JSONDecodeError:
                pass

            # Create attendee record
            attendee = Attendee.create({
                'schedule_id': schedule_id,
                'user_id': request.env.user.id,
                'notes': notes,
                'state': 'registered',
            })

            return self._json_response({
                'success': True,
                'message': 'Successfully registered for this session',
                'data': {
                    'attendeeId': attendee.id,
                    'scheduleId': schedule_id,
                    'registrationDate': attendee.registration_date.isoformat() if attendee.registration_date else None,
                },
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e),
            }, status=500)

    @http.route('/api/schedules/my-registrations', type='http', auth='user', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def get_my_registrations(self, **kwargs):
        """Get schedules the current user is registered for."""
        try:
            Attendee = request.env['seitech.schedule.attendee'].sudo()

            attendees = Attendee.search([
                ('user_id', '=', request.env.user.id),
                ('state', 'in', ('registered', 'attended')),
            ], order='schedule_id desc')

            schedules = []
            for att in attendees:
                schedule_data = self._get_schedule_data(att.schedule_id)
                schedule_data['registrationId'] = att.id
                schedule_data['registrationState'] = att.state
                schedule_data['registrationDate'] = att.registration_date.isoformat() if att.registration_date else None
                schedules.append(schedule_data)

            return self._json_response({
                'success': True,
                'data': schedules,
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'message': str(e),
                'data': None,
            }, status=500)
