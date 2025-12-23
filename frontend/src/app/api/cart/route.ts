import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getOdooClient } from '@/lib/api/odoo-client';
import type { ApiResponse } from '@/types';
// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


const AddToCartSchema = z.object({
  courseId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});

interface CartItem {
  id: number;
  courseId: number;
  courseName: string;
  courseSlug: string;
  courseImage: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  subtotal: number;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

export async function GET(request: NextRequest) {
  try {
    const odoo = getOdooClient();

    // Get current session
    const session = await odoo.getSession();

    if (!session || !session.uid) {
      // Return empty cart for guests
      const emptyCart: Cart = {
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        itemCount: 0,
      };

      return NextResponse.json({
        success: true,
        data: emptyCart,
      });
    }

    // Fetch current sale order (cart) for the user
    const orderRecords = await odoo.searchRead<any>(
      'sale.order',
      [
        ['partner_id', '=', session.partnerId],
        ['state', '=', 'draft'],
      ],
      ['id', 'order_line', 'amount_untaxed', 'amount_tax', 'amount_total'],
      { limit: 1, order: 'write_date desc' }
    );

    if (!orderRecords || orderRecords.length === 0) {
      // No cart exists
      const emptyCart: Cart = {
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        itemCount: 0,
      };

      return NextResponse.json({
        success: true,
        data: emptyCart,
      });
    }

    const order = orderRecords[0];

    // Fetch order lines (cart items)
    const orderLineIds = order.order_line || [];
    const orderLines =
      orderLineIds.length > 0
        ? await odoo.read<any>(
            'sale.order.line',
            orderLineIds,
            ['id', 'product_id', 'product_uom_qty', 'price_unit', 'price_subtotal']
          )
        : [];

    // Fetch product (course) details
    const productIds = orderLines.map((line: any) => line.product_id?.[0]).filter(Boolean);
    const products =
      productIds.length > 0
        ? await odoo.read<any>(
            'product.product',
            productIds,
            ['id', 'name', 'image_128', 'list_price', 'slide_channel_id']
          )
        : [];

    const productMap = new Map(products.map((p: any) => [p.id, p]));

    // Fetch course details
    const courseIds = products
      .map((p: any) => p.slide_channel_id?.[0])
      .filter(Boolean);
    const courses =
      courseIds.length > 0
        ? await odoo.read<any>(
            'slide.channel',
            courseIds,
            ['id', 'name', 'website_slug', 'image_512', 'list_price', 'discount_price']
          )
        : [];

    const courseMap = new Map(courses.map((c: any) => [c.id, c]));

    const items: CartItem[] = orderLines.map((line: any) => {
      const product = productMap.get(line.product_id?.[0]);
      const courseId = product?.slide_channel_id?.[0] || 0;
      const course = courseMap.get(courseId);

      return {
        id: line.id,
        courseId: courseId,
        courseName: course?.name || product?.name || line.product_id?.[1] || '',
        courseSlug: course?.website_slug || '',
        courseImage: course?.image_512
          ? `data:image/png;base64,${course.image_512}`
          : product?.image_128
          ? `data:image/png;base64,${product.image_128}`
          : '',
        price: line.price_unit,
        discountPrice: course?.discount_price || undefined,
        quantity: line.product_uom_qty || 1,
        subtotal: line.price_subtotal,
      };
    });

    const cart: Cart = {
      items,
      subtotal: order.amount_untaxed || 0,
      tax: order.amount_tax || 0,
      total: order.amount_total || 0,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };

    const response: ApiResponse<Cart> = {
      success: true,
      data: cart,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching cart:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch cart',
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const data = AddToCartSchema.parse(body);

    const odoo = getOdooClient();

    // Get current session
    const session = await odoo.getSession();

    if (!session || !session.uid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please log in to add items to cart',
          data: null,
        },
        { status: 401 }
      );
    }

    // Find or create a draft sale order for the user
    let orderRecords = await odoo.searchRead<any>(
      'sale.order',
      [
        ['partner_id', '=', session.partnerId],
        ['state', '=', 'draft'],
      ],
      ['id'],
      { limit: 1, order: 'write_date desc' }
    );

    let orderId: number;

    if (!orderRecords || orderRecords.length === 0) {
      // Create a new sale order (cart)
      orderId = await odoo.create('sale.order', {
        partner_id: session.partnerId,
        state: 'draft',
      });
    } else {
      orderId = orderRecords[0].id;
    }

    // Find the product associated with the course
    const courseRecords = await odoo.read<any>(
      'slide.channel',
      [data.courseId],
      ['id', 'product_id']
    );

    if (!courseRecords || courseRecords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Course not found',
          data: null,
        },
        { status: 404 }
      );
    }

    const course = courseRecords[0];
    const productId = course.product_id?.[0];

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Course product not configured',
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if product is already in cart
    const existingLines = await odoo.searchRead<any>(
      'sale.order.line',
      [
        ['order_id', '=', orderId],
        ['product_id', '=', productId],
      ],
      ['id', 'product_uom_qty']
    );

    if (existingLines && existingLines.length > 0) {
      // Update quantity
      const lineId = existingLines[0].id;
      const newQuantity = existingLines[0].product_uom_qty + data.quantity;

      await odoo.write('sale.order.line', [lineId], {
        product_uom_qty: newQuantity,
      });
    } else {
      // Add new order line
      await odoo.create('sale.order.line', {
        order_id: orderId,
        product_id: productId,
        product_uom_qty: data.quantity,
      });
    }

    // Fetch updated cart
    const updatedOrderRecords = await odoo.read<any>(
      'sale.order',
      [orderId],
      ['order_line', 'amount_untaxed', 'amount_tax', 'amount_total']
    );

    const updatedOrder = updatedOrderRecords[0];

    const response: ApiResponse<{ orderId: number; itemCount: number; total: number }> = {
      success: true,
      message: 'Item added to cart',
      data: {
        orderId,
        itemCount: updatedOrder.order_line?.length || 0,
        total: updatedOrder.amount_total || 0,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error adding to cart:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add to cart',
        data: null,
      },
      { status: 500 }
    );
  }
}
