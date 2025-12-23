import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getOdooClient } from '@/lib/api/odoo-client';
import type { ApiResponse } from '@/types';
// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


const ContactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const data = ContactFormSchema.parse(body);

    const odoo = getOdooClient();

    // Create a lead/opportunity in CRM or a helpdesk ticket
    // Using crm.lead model for contact form submissions
    const leadId = await odoo.create('crm.lead', {
      name: data.subject,
      contact_name: `${data.firstName} ${data.lastName}`,
      email_from: data.email,
      phone: data.phone || false,
      description: data.message,
      type: 'lead',
      priority: '2', // Medium priority
      team_id: false, // Will be assigned based on Odoo's rules
    });

    // Alternatively, create a mail message for tracking
    await odoo.create('mail.message', {
      model: 'crm.lead',
      res_id: leadId,
      body: `<p><strong>Contact Form Submission</strong></p>
             <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
             <p><strong>Email:</strong> ${data.email}</p>
             ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
             <p><strong>Subject:</strong> ${data.subject}</p>
             <p><strong>Message:</strong></p>
             <p>${data.message}</p>`,
      message_type: 'comment',
      subtype_id: 1, // Note subtype
    });

    const response: ApiResponse<{ id: number }> = {
      success: true,
      message: 'Thank you for contacting us. We will get back to you shortly.',
      data: { id: leadId },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Contact form error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form data',
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit contact form',
        data: null,
      },
      { status: 500 }
    );
  }
}
