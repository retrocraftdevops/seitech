# -*- coding: utf-8 -*-
"""Sale order extension for course purchases."""
from odoo import models, fields, api, _


class SaleOrder(models.Model):
    """Extend sale.order to handle course enrollments."""
    _inherit = 'sale.order'

    def _action_confirm(self):
        """Override to create course enrollments on order confirmation."""
        result = super()._action_confirm()
        self._create_course_enrollments()
        return result

    def _create_course_enrollments(self):
        """Create course enrollments for purchased course products."""
        Enrollment = self.env['seitech.enrollment']
        Channel = self.env['slide.channel']

        for order in self:
            for line in order.order_line:
                # Find courses linked to this product
                course = Channel.search([
                    ('product_id', '=', line.product_id.id),
                ], limit=1)

                if course and order.partner_id:
                    # Get user from partner
                    user = self.env['res.users'].search([
                        ('partner_id', '=', order.partner_id.id),
                    ], limit=1)

                    if not user:
                        # Create portal user for the partner
                        user = self._create_portal_user(order.partner_id)

                    if user:
                        # Check if already enrolled
                        existing = Enrollment.search([
                            ('channel_id', '=', course.id),
                            ('user_id', '=', user.id),
                        ], limit=1)

                        if not existing:
                            enrollment = Enrollment.create({
                                'channel_id': course.id,
                                'user_id': user.id,
                                'enrollment_type': 'paid',
                                'amount_paid': line.price_total,
                                'sale_order_id': order.id,
                                'state': 'pending',
                            })
                            # Will be activated when payment is confirmed

    def _create_portal_user(self, partner):
        """Create a portal user for the partner."""
        self.ensure_one()
        if not partner.email:
            return None

        # Check if user already exists with this email
        existing_user = self.env['res.users'].search([
            ('login', '=', partner.email),
        ], limit=1)
        if existing_user:
            return existing_user

        # Check if user exists by partner
        existing_user = self.env['res.users'].search([
            ('partner_id', '=', partner.id),
        ], limit=1)
        if existing_user:
            return existing_user

        # Create portal user directly
        try:
            portal_group = self.env.ref('base.group_portal', raise_if_not_found=False)
            if not portal_group:
                return None

            # In Odoo 19, we must set group_ids during creation to override defaults
            # The default _default_groups assigns base.group_user which conflicts with portal
            user = self.env['res.users'].with_context(no_reset_password=True).create({
                'name': partner.name,
                'login': partner.email,
                'email': partner.email,
                'partner_id': partner.id,
                'active': True,
                'group_ids': [(6, 0, [portal_group.id])],  # Replace all groups with just portal
            })
            return user
        except Exception:
            return None


class SaleOrderLine(models.Model):
    """Extend sale.order.line with course reference."""
    _inherit = 'sale.order.line'

    course_id = fields.Many2one(
        'slide.channel',
        string='Course',
        compute='_compute_course_id',
        store=True,
    )

    @api.depends('product_id')
    def _compute_course_id(self):
        Channel = self.env['slide.channel']
        for line in self:
            if line.product_id:
                course = Channel.search([
                    ('product_id', '=', line.product_id.id),
                ], limit=1)
                line.course_id = course.id if course else False
            else:
                line.course_id = False


class AccountPayment(models.Model):
    """Extend account.payment to activate enrollments on payment."""
    _inherit = 'account.payment'

    def action_post(self):
        """Override to activate enrollments when payment is confirmed."""
        result = super().action_post()
        self._activate_course_enrollments()
        return result

    def _activate_course_enrollments(self):
        """Activate pending enrollments for paid orders."""
        Enrollment = self.env['seitech.enrollment']

        for payment in self:
            # Find related sale orders through reconciled invoices
            for invoice in payment.reconciled_invoice_ids:
                for invoice_line in invoice.invoice_line_ids:
                    # Find sale order line
                    sale_line = invoice_line.sale_line_ids
                    if sale_line:
                        order = sale_line.order_id
                        # Find pending enrollments for this order
                        enrollments = Enrollment.search([
                            ('sale_order_id', '=', order.id),
                            ('state', '=', 'pending'),
                        ])
                        for enrollment in enrollments:
                            enrollment.write({
                                'payment_id': payment.id,
                                'state': 'active',
                            })
                            enrollment.action_activate()
