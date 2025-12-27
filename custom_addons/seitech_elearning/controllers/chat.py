# -*- coding: utf-8 -*-
import json
from odoo import http, _
from odoo.http import request
from odoo.exceptions import AccessError, ValidationError


class ChatController(http.Controller):
    """Chat API endpoints"""
    
    def _json_response(self, data, status=200):
        """Return JSON response with CORS headers."""
        return request.make_response(
            json.dumps(data),
            headers=[
                ('Content-Type', 'application/json'),
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE'),
                ('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token'),
                ('Access-Control-Allow-Credentials', 'true'),
            ],
            status=status
        )
    
    @http.route('/api/chat/channels', type='http', auth='user', methods=['POST', 'OPTIONS'], csrf=False, cors='*')
    def get_channels(self):
        """Get user's chat channels"""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({}, 204)
            
        try:
            # Get data from request
            if request.httprequest.content_type and 'application/json' in request.httprequest.content_type:
                data = json.loads(request.httprequest.data)
            else:
                data = request.params
                
            channel_types = data.get('channel_types')
            
            channels = request.env['seitech.chat.channel'].get_user_channels(channel_types)
            
            return self._json_response({
                'success': True,
                'channels': [{
                    'id': ch.id,
                    'name': ch.name,
                    'type': ch.channel_type,
                    'unread_count': ch.unread_count,
                    'last_message_date': ch.last_message_date.isoformat() if ch.last_message_date else None,
                    'last_message_preview': ch.last_message_preview,
                    'member_count': len(ch.member_ids),
                    'course_id': ch.course_id.id if ch.course_id else None,
                    'course_name': ch.course_id.name if ch.course_id else None,
                } for ch in channels]
            })
        except Exception as e:
            return self._json_response({'success': False, 'error': str(e)}, 500)
    
    @http.route('/api/chat/channel/<int:channel_id>', type='json', auth='user', methods=['POST'], csrf=False)
    def get_channel(self, channel_id):
        """Get channel details"""
        try:
            channel = request.env['seitech.chat.channel'].browse(channel_id)
            
            if not channel.exists():
                return {'success': False, 'error': 'Channel not found'}
            
            # Check access
            if request.env.user not in channel.member_ids and not request.env.user.has_group('seitech_elearning.group_elearning_manager'):
                return {'success': False, 'error': 'Access denied'}
            
            return {
                'success': True,
                'channel': {
                    'id': channel.id,
                    'name': channel.name,
                    'type': channel.channel_type,
                    'state': channel.state,
                    'is_public': channel.is_public,
                    'members': [{
                        'id': m.id,
                        'name': m.name,
                        'image': m.image_128.decode() if m.image_128 else None,
                    } for m in channel.member_ids],
                    'moderators': channel.moderator_ids.ids,
                    'course': {
                        'id': channel.course_id.id,
                        'name': channel.course_id.name,
                    } if channel.course_id else None,
                }
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @http.route('/api/chat/messages', type='json', auth='user', methods=['POST'], csrf=False)
    def get_messages(self, channel_id, limit=50, offset=0):
        """Get channel messages"""
        try:
            channel = request.env['seitech.chat.channel'].browse(channel_id)
            
            if not channel.exists():
                return {'success': False, 'error': 'Channel not found'}
            
            # Check access
            if request.env.user not in channel.member_ids and not request.env.user.has_group('seitech_elearning.group_elearning_manager'):
                return {'success': False, 'error': 'Access denied'}
            
            messages = request.env['seitech.chat.message'].search([
                ('channel_id', '=', channel_id)
            ], order='create_date desc', limit=limit, offset=offset)
            
            # Mark messages as read
            channel.action_mark_read()
            
            return {
                'success': True,
                'messages': [{
                    'id': msg.id,
                    'content': msg.content,
                    'type': msg.message_type,
                    'author': {
                        'id': msg.author_id.id if msg.author_id else None,
                        'name': msg.author_id.name if msg.author_id else msg.author_name,
                        'image': msg.author_id.image_128.decode() if msg.author_id and msg.author_id.image_128 else None,
                    },
                    'created_at': msg.create_date.isoformat() if msg.create_date else None,
                    'is_read': msg.is_read,
                    'attachments': [{
                        'id': att.id,
                        'name': att.name,
                        'mimetype': att.mimetype,
                        'url': f'/web/content/{att.id}',
                    } for att in msg.attachment_ids],
                    'reactions': [{
                        'emoji': r.emoji,
                        'user_id': r.user_id.id,
                        'user_name': r.user_id.name,
                    } for r in msg.reaction_ids],
                    'reply_count': msg.reply_count,
                    'parent_id': msg.parent_id.id if msg.parent_id else None,
                } for msg in reversed(messages)],  # Reverse to show oldest first
                'has_more': len(messages) == limit,
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @http.route('/api/chat/send', type='json', auth='user', methods=['POST'], csrf=False)
    def send_message(self, channel_id, content, parent_id=None, message_type='text'):
        """Send message to channel"""
        try:
            channel = request.env['seitech.chat.channel'].browse(channel_id)
            
            if not channel.exists():
                return {'success': False, 'error': 'Channel not found'}
            
            message = request.env['seitech.chat.message'].create({
                'channel_id': channel_id,
                'author_id': request.env.user.id,
                'content': content,
                'message_type': message_type,
                'parent_id': parent_id,
            })
            
            # Notify channel members
            channel._notify_new_message(message)
            
            return {
                'success': True,
                'message': {
                    'id': message.id,
                    'content': message.content,
                    'type': message.message_type,
                    'author': {
                        'id': message.author_id.id,
                        'name': message.author_id.name,
                        'image': message.author_id.image_128.decode() if message.author_id.image_128 else None,
                    },
                    'created_at': message.create_date.isoformat(),
                }
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @http.route('/api/chat/create-direct', type='json', auth='user', methods=['POST'], csrf=False)
    def create_direct_channel(self, user_id):
        """Create or get direct message channel"""
        try:
            channel = request.env['seitech.chat.channel'].get_or_create_direct_channel([
                request.env.user.id,
                user_id
            ])
            
            return {
                'success': True,
                'channel_id': channel.id,
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @http.route('/api/chat/create-student-instructor', type='json', auth='user', methods=['POST'], csrf=False)
    def create_student_instructor_channel(self, instructor_id, course_id=None):
        """Create student-instructor channel"""
        try:
            channel = request.env['seitech.chat.channel'].create_student_instructor_channel(
                request.env.user.id,
                instructor_id,
                course_id
            )
            
            return {
                'success': True,
                'channel_id': channel.id,
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @http.route('/api/chat/support', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False, cors='*')
    def create_support_channel(self):
        """Create public support channel for anonymous users"""
        # Handle CORS preflight
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({}, 204)
            
        try:
            # Handle both JSON and form data
            if request.httprequest.content_type and 'application/json' in request.httprequest.content_type:
                data = json.loads(request.httprequest.data)
            else:
                data = request.params
            
            # Get or create session token
            session_token = data.get('session_token') or request.session.sid
            visitor_name = data.get('name', 'Guest')
            visitor_email = data.get('email')
            
            visitor_info = {
                'ip': request.httprequest.remote_addr,
                'user_agent': request.httprequest.user_agent.string,
                'referrer': request.httprequest.referrer,
                'name': visitor_name,
                'email': visitor_email,
            }
            
            channel = request.env['seitech.chat.channel'].sudo().create_support_channel(
                session_token=session_token,
                visitor_info=visitor_info
            )
            
            # Create welcome message if name is provided
            if visitor_name and visitor_name != 'Guest':
                request.env['seitech.chat.message'].sudo().create({
                    'channel_id': channel.id,
                    'author_name': visitor_name,
                    'content': f'Hello! {visitor_name} has joined the chat.',
                    'message_type': 'system',
                })
            
            return self._json_response({
                'success': True,
                'channel_id': channel.id,
                'session_token': session_token,
            })
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            return self._json_response({
                'success': False,
                'error': str(e),
                'trace': error_trace if request.env.user.has_group('base.group_system') else None
            }, 500)
    
    @http.route('/api/chat/support/send', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False, cors='*')
    def send_support_message(self):
        """Send message to support channel (public access)"""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({}, 204)
            
        try:
            data = json.loads(request.httprequest.data)
            channel_id = data.get('channel_id')
            content = data.get('content')
            session_token = data.get('session_token')
            
            if not all([channel_id, content, session_token]):
                return self._json_response({
                    'success': False,
                    'error': 'Missing required fields'
                }, 400)
            
            channel = request.env['seitech.chat.channel'].sudo().browse(channel_id)
            
            if not channel.exists() or channel.session_token != session_token:
                return self._json_response({
                    'success': False,
                    'error': 'Invalid channel or session'
                }, 401)
            
            message = request.env['seitech.chat.message'].sudo().create({
                'channel_id': channel_id,
                'author_name': data.get('author_name', 'Guest'),
                'content': content,
                'message_type': 'text',
            })
            
            # Notify agents
            channel._notify_new_message(message)
            
            return self._json_response({
                'success': True,
                'message_id': message.id,
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'error': str(e)
            }, 500)
    
    @http.route('/api/chat/support/<int:channel_id>/messages', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def get_support_messages(self, channel_id):
        """Get messages for support channel (public access)"""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({}, 204)
            
        try:
            session_token = request.httprequest.headers.get('X-Session-Token')
            if not session_token:
                return self._json_response({
                    'success': False,
                    'error': 'Session token required'
                }, 401)
            
            channel = request.env['seitech.chat.channel'].sudo().browse(channel_id)
            if not channel.exists() or channel.session_token != session_token:
                return self._json_response({
                    'success': False,
                    'error': 'Invalid channel or session'
                }, 401)
            
            messages = request.env['seitech.chat.message'].sudo().search([
                ('channel_id', '=', channel_id)
            ], order='create_date asc', limit=50)
            
            return self._json_response({
                'success': True,
                'messages': [{
                    'id': msg.id,
                    'content': msg.content,
                    'author_name': msg.author_name or 'Support Agent',
                    'created_at': msg.create_date.isoformat() if msg.create_date else '',
                    'is_agent': bool(msg.author_id),
                } for msg in messages]
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'error': str(e)
            }, 500)
    
    @http.route('/api/chat/support/<int:channel_id>/poll', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False, cors='*')
    def poll_support_messages(self, channel_id):
        """Poll for new messages in support channel (public access)"""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({}, 204)
            
        try:
            session_token = request.params.get('session_token')
            last_message_id = int(request.params.get('last_message_id', 0))
            
            if not session_token:
                return self._json_response({
                    'success': False,
                    'error': 'Session token required'
                }, 401)
            
            channel = request.env['seitech.chat.channel'].sudo().browse(channel_id)
            if not channel.exists() or channel.session_token != session_token:
                return self._json_response({
                    'success': False,
                    'error': 'Invalid channel or session'
                }, 401)
            
            messages = request.env['seitech.chat.message'].sudo().search([
                ('channel_id', '=', channel_id),
                ('id', '>', last_message_id)
            ], order='create_date asc', limit=20)
            
            return self._json_response({
                'success': True,
                'messages': [{
                    'id': msg.id,
                    'content': msg.content,
                    'author_name': msg.author_name or 'Support Agent',
                    'created_at': msg.create_date.isoformat() if msg.create_date else '',
                    'is_agent': bool(msg.author_id),
                } for msg in messages],
                'is_typing': False  # TODO: Implement typing indicator
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'error': str(e)
            }, 500)
    
    @http.route('/api/chat/support/upload', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False, cors='*')
    def upload_support_file(self):
        """Upload file attachment for support chat (public access)"""
        if request.httprequest.method == 'OPTIONS':
            return self._json_response({}, 204)
            
        try:
            channel_id = request.params.get('channel_id')
            session_token = request.params.get('session_token')
            
            if not channel_id or not session_token:
                return self._json_response({
                    'success': False,
                    'error': 'Missing required fields'
                }, 400)
            
            channel = request.env['seitech.chat.channel'].sudo().browse(int(channel_id))
            
            if not channel.exists() or channel.session_token != session_token:
                return self._json_response({
                    'success': False,
                    'error': 'Invalid channel or session'
                }, 401)
            
            # Get uploaded file
            file = request.httprequest.files.get('file')
            if not file:
                return self._json_response({
                    'success': False,
                    'error': 'No file provided'
                }, 400)
            
            # Create attachment
            attachment = request.env['ir.attachment'].sudo().create({
                'name': file.filename,
                'datas': file.read(),
                'res_model': 'seitech.chat.channel',
                'res_id': channel.id,
                'mimetype': file.content_type or 'application/octet-stream',
            })
            
            # Create message with attachment
            message = request.env['seitech.chat.message'].sudo().create({
                'channel_id': channel.id,
                'author_name': request.params.get('author_name', 'Guest'),
                'content': f'Sent a file: {file.filename}',
                'message_type': 'file' if 'image' not in file.content_type else 'image',
                'attachment_ids': [(6, 0, [attachment.id])],
            })
            
            # Notify agents
            channel._notify_new_message(message)
            
            return self._json_response({
                'success': True,
                'message_id': message.id,
                'file_url': f'/web/content/{attachment.id}',
            })
        except Exception as e:
            import traceback
            return self._json_response({
                'success': False,
                'error': str(e),
                'trace': traceback.format_exc() if request.env.user.has_group('base.group_system') else None
            }, 500)
    
    @http.route('/api/chat/reaction', type='json', auth='user', methods=['POST'], csrf=False)
    def toggle_reaction(self, message_id, emoji):
        """Add or remove reaction to message"""
        try:
            message = request.env['seitech.chat.message'].browse(message_id)
            
            if not message.exists():
                return {'success': False, 'error': 'Message not found'}
            
            message.action_toggle_reaction(emoji)
            
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @http.route('/api/chat/typing', type='json', auth='user', methods=['POST'], csrf=False)
    def send_typing_indicator(self, channel_id):
        """Send typing indicator"""
        try:
            channel = request.env['seitech.chat.channel'].browse(channel_id)
            
            if not channel.exists():
                return {'success': False, 'error': 'Channel not found'}
            
            # Send bus notification
            notifications = []
            for member in channel.member_ids:
                if member != request.env.user:
                    notifications.append((
                        member.partner_id,
                        'seitech.chat/typing',
                        {
                            'channel_id': channel_id,
                            'user_id': request.env.user.id,
                            'user_name': request.env.user.name,
                        }
                    ))
            
            if notifications:
                request.env['bus.bus']._sendmany(notifications)
            
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
