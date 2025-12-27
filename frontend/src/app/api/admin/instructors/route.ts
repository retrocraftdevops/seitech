import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const userInfo = cookieStore.get('user_info')?.value;

    if (!sessionToken || !userInfo) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userInfo);
    // Check role permissions
    if (!['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo
    if (odooUrl) {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status })
      });

      const response = await fetch(`${odooUrl}/api/admin/instructors?${queryParams}`, {
        headers: { 'Cookie': `session_id=${sessionToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Demo mode fallback with mock data
    const mockInstructors = [
      {
        id: 1,
        name: 'Dr. Sarah Williams',
        email: 'sarah.williams@seitech.com',
        status: 'active',
        expertise: ['Data Science', 'Machine Learning', 'Python'],
        bio: 'PhD in Computer Science with 15 years of industry experience',
        courses: 8,
        students: 456,
        rating: 4.9,
        totalReviews: 234,
        joinDate: '2024-01-10',
        lastActive: '2025-12-23'
      },
      {
        id: 2,
        name: 'Prof. Michael Chen',
        email: 'michael.chen@seitech.com',
        status: 'active',
        expertise: ['Web Development', 'React', 'Node.js'],
        bio: 'Full-stack developer and educator with passion for modern web technologies',
        courses: 6,
        students: 389,
        rating: 4.8,
        totalReviews: 198,
        joinDate: '2024-01-15',
        lastActive: '2025-12-24'
      },
      {
        id: 3,
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@seitech.com',
        status: 'active',
        expertise: ['Artificial Intelligence', 'Deep Learning', 'TensorFlow'],
        bio: 'AI researcher and practitioner specializing in neural networks',
        courses: 5,
        students: 312,
        rating: 4.7,
        totalReviews: 167,
        joinDate: '2024-02-01',
        lastActive: '2025-12-23'
      },
      {
        id: 4,
        name: 'James Anderson',
        email: 'james.anderson@seitech.com',
        status: 'active',
        expertise: ['Cloud Computing', 'AWS', 'DevOps'],
        bio: 'Cloud architect with certifications in AWS, Azure, and GCP',
        courses: 7,
        students: 298,
        rating: 4.6,
        totalReviews: 145,
        joinDate: '2024-01-20',
        lastActive: '2025-12-22'
      },
      {
        id: 5,
        name: 'Lisa Thompson',
        email: 'lisa.thompson@seitech.com',
        status: 'active',
        expertise: ['Mobile Development', 'React Native', 'Flutter'],
        bio: 'Mobile app developer with 50+ published applications',
        courses: 4,
        students: 267,
        rating: 4.8,
        totalReviews: 156,
        joinDate: '2024-03-05',
        lastActive: '2025-12-24'
      },
      {
        id: 6,
        name: 'Dr. Robert Kumar',
        email: 'robert.kumar@seitech.com',
        status: 'inactive',
        expertise: ['Cybersecurity', 'Ethical Hacking'],
        bio: 'Security expert and ethical hacker',
        courses: 3,
        students: 145,
        rating: 4.5,
        totalReviews: 89,
        joinDate: '2024-02-15',
        lastActive: '2025-11-10'
      }
    ];

    let filteredInstructors = mockInstructors;
    if (search) {
      filteredInstructors = filteredInstructors.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.email.toLowerCase().includes(search.toLowerCase()) ||
        i.expertise.some(e => e.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (status) {
      filteredInstructors = filteredInstructors.filter(i => i.status === status);
    }

    const startIndex = (page - 1) * limit;
    const paginatedInstructors = filteredInstructors.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginatedInstructors,
      pagination: {
        page,
        limit,
        total: filteredInstructors.length,
        totalPages: Math.ceil(filteredInstructors.length / limit)
      }
    });
  } catch (error) {
    console.error('Instructors list error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const userInfo = cookieStore.get('user_info')?.value;

    if (!sessionToken || !userInfo) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userInfo);
    // Check role permissions
    if (!['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, expertise, bio } = body;

    // Validate required fields
    if (!name || !email || !password || !expertise) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo
    if (odooUrl) {
      const response = await fetch(`${odooUrl}/api/admin/instructors`, {
        method: 'POST',
        headers: {
          'Cookie': `session_id=${sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Demo mode fallback
    const newInstructor = {
      id: Math.floor(Math.random() * 10000),
      name,
      email,
      expertise,
      bio: bio || '',
      status: 'active',
      courses: 0,
      students: 0,
      rating: 0,
      totalReviews: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newInstructor,
      message: 'Instructor created successfully'
    });
  } catch (error) {
    console.error('Instructor creation error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
