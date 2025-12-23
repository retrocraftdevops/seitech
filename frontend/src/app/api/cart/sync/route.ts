import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getOdooClient } from '@/lib/api/odoo-client';
import type { ApiResponse } from '@/types';
// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


const SyncCartSchema = z.object({
  items: z.array(
    z.object({
      courseId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const data = SyncCartSchema.parse(body);

    const odoo = getOdooClient();

    // Get current session
    const session = await odoo.getSession();

    if (!session || !session.uid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please log in to sync cart',
          data: null,
        },
        { status: 401 }
      );
    }

    // Find or create a draft sale order
    let orderRecords = await odoo.searchRead<any>(
      'sale.order',
      [
        ['partner_id', '=', session.partnerId],
        ['state', '=', 'draft'],
      ],
      ['id', 'order_line'],
      { limit: 1, order: 'write_date desc' }
    );

    let orderId: number;

    if (!orderRecords || orderRecords.length === 0) {
      // Create a new sale order
      orderId = await odoo.create('sale.order', {
        partner_id: session.partnerId,
        state: 'draft',
      });
    } else {
      orderId = orderRecords[0].id;

      // Remove existing order lines
      const existingLineIds = orderRecords[0].order_line || [];
      if (existingLineIds.length > 0) {
        await odoo.unlink('sale.order.line', existingLineIds);
      }
    }

    // Add all items from the sync request
    for (const item of data.items) {
      // Fetch course to get product_id
      const courseRecords = await odoo.read<any>(
        'slide.channel',
        [item.courseId],
        ['id', 'product_id']
      );

      if (!courseRecords || courseRecords.length === 0) {
        console.warn(`Course ${item.courseId} not found, skipping`);
        continue;
      }

      const course = courseRecords[0];
      const productId = course.product_id?.[0];

      if (!productId) {
        console.warn(`Course ${item.courseId} has no product configured, skipping`);
        continue;
      }

      // Create order line
      await odoo.create('sale.order.line', {
        order_id: orderId,
        product_id: productId,
        product_uom_qty: item.quantity,
      });
    }

    // Fetch updated cart summary
    const updatedOrderRecords = await odoo.read<any>(
      'sale.order',
      [orderId],
      ['order_line', 'amount_untaxed', 'amount_tax', 'amount_total']
    );

    const updatedOrder = updatedOrderRecords[0];

    const response: ApiResponse<{
      orderId: number;
      itemCount: number;
      total: number;
      synced: number;
    }> = {
      success: true,
      message: 'Cart synced successfully',
      data: {
        orderId,
        itemCount: updatedOrder.order_line?.length || 0,
        total: updatedOrder.amount_total || 0,
        synced: data.items.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error syncing cart:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid cart data',
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sync cart',
        data: null,
      },
      { status: 500 }
    );
  }
}
