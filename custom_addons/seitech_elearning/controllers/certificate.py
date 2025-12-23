# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request


class CertificateController(http.Controller):
    """Controllers for certificate verification and download."""

    @http.route('/certificate/verify', type='http', auth='public', website=True)
    def verify_certificate_page(self, code=None, **kwargs):
        """Certificate verification page."""
        Certificate = request.env['seitech.certificate'].sudo()

        result = {}
        certificate = None

        if code:
            result = Certificate.verify_certificate(code)
            certificate = result.get('certificate')

        return request.render('seitech_elearning.certificate_verify', {
            'result': result,
            'certificate': certificate,
            'code': code,
        })

    @http.route('/certificate/verify/<string:code>', type='http', auth='public', website=True)
    def verify_certificate_direct(self, code, **kwargs):
        """Direct verification via URL."""
        return self.verify_certificate_page(code=code)

    @http.route('/api/certificate/verify', type='json', auth='public')
    def verify_certificate_api(self, code, **kwargs):
        """API endpoint for certificate verification."""
        Certificate = request.env['seitech.certificate'].sudo()
        result = Certificate.verify_certificate(code)

        if result.get('valid') and result.get('certificate'):
            cert = result['certificate']
            return {
                'valid': True,
                'certificate': {
                    'number': cert.name,
                    'holder_name': cert.user_id.name,
                    'course_name': cert.channel_id.name,
                    'issue_date': cert.issue_date.isoformat() if cert.issue_date else None,
                    'expiration_date': cert.expiration_date.isoformat() if cert.expiration_date else None,
                    'completion_percentage': cert.completion_percentage,
                }
            }
        else:
            return {
                'valid': False,
                'error': result.get('error', 'Verification failed'),
            }

    @http.route('/my/certificates/<int:cert_id>', type='http', auth='user', website=True)
    def view_certificate(self, cert_id, **kwargs):
        """View a specific certificate."""
        Certificate = request.env['seitech.certificate'].sudo()
        user = request.env.user

        certificate = Certificate.browse(cert_id)
        if not certificate.exists() or certificate.user_id.id != user.id:
            return request.redirect('/my/certificates')

        return request.render('seitech_elearning.view_certificate', {
            'certificate': certificate,
        })

    @http.route('/my/certificates/<int:cert_id>/download', type='http', auth='user', website=True)
    def download_certificate(self, cert_id, **kwargs):
        """Download certificate PDF."""
        Certificate = request.env['seitech.certificate'].sudo()
        user = request.env.user

        certificate = Certificate.browse(cert_id)
        if not certificate.exists() or certificate.user_id.id != user.id:
            return request.redirect('/my/certificates')

        if not certificate.certificate_pdf:
            certificate.action_generate_pdf()

        if certificate.certificate_pdf:
            import base64
            pdf_content = base64.b64decode(certificate.certificate_pdf)
            filename = certificate.certificate_filename or f'{certificate.name}.pdf'

            return request.make_response(
                pdf_content,
                headers=[
                    ('Content-Type', 'application/pdf'),
                    ('Content-Disposition', f'attachment; filename="{filename}"'),
                ]
            )

        return request.redirect(f'/my/certificates/{cert_id}')

    @http.route('/my/certificates/<int:cert_id>/share', type='http', auth='user', website=True)
    def share_certificate(self, cert_id, **kwargs):
        """Get shareable link for certificate."""
        Certificate = request.env['seitech.certificate'].sudo()
        user = request.env.user

        certificate = Certificate.browse(cert_id)
        if not certificate.exists() or certificate.user_id.id != user.id:
            return request.redirect('/my/certificates')

        return request.render('seitech_elearning.share_certificate', {
            'certificate': certificate,
            'verification_url': certificate.verification_url,
        })
