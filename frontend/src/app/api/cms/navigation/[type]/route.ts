import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, CmsNavItem } from '@/types';

export const dynamic = 'force-dynamic';

// Default navigation items for when Odoo is unavailable
const defaultNavigation: Record<string, CmsNavItem[]> = {
  header: [
    {
      id: 1,
      name: 'Training',
      url: '/training',
      icon: '',
      description: 'Browse our courses',
      openNewTab: false,
      isHighlighted: false,
      children: [
        { id: 11, name: 'All Courses', url: '/courses', icon: '', description: '', openNewTab: false, isHighlighted: false, children: [] },
        { id: 12, name: 'IOSH Courses', url: '/courses/iosh', icon: '', description: '', openNewTab: false, isHighlighted: false, children: [] },
        { id: 13, name: 'NEBOSH Courses', url: '/courses/nebosh', icon: '', description: '', openNewTab: false, isHighlighted: false, children: [] },
        { id: 14, name: 'First Aid', url: '/courses/first-aid', icon: '', description: '', openNewTab: false, isHighlighted: false, children: [] },
      ],
    },
    {
      id: 2,
      name: 'Consultancy',
      url: '/consultancy',
      icon: '',
      description: 'Expert consultancy services',
      openNewTab: false,
      isHighlighted: false,
      children: [],
    },
    {
      id: 3,
      name: 'E-Learning',
      url: '/e-learning',
      icon: '',
      description: 'Online training platform',
      openNewTab: false,
      isHighlighted: false,
      children: [],
    },
    {
      id: 4,
      name: 'About',
      url: '/about',
      icon: '',
      description: 'About SEI Tech',
      openNewTab: false,
      isHighlighted: false,
      children: [],
    },
    {
      id: 5,
      name: 'Contact',
      url: '/contact',
      icon: '',
      description: 'Get in touch',
      openNewTab: false,
      isHighlighted: true,
      children: [],
    },
  ],
  footer: [
    {
      id: 101,
      name: 'Quick Links',
      url: '#',
      icon: '',
      description: '',
      openNewTab: false,
      isHighlighted: false,
      children: [
        { id: 111, name: 'Home', url: '/', icon: '', description: '', openNewTab: false, isHighlighted: false, children: [] },
        { id: 112, name: 'Courses', url: '/courses', icon: '', description: '', openNewTab: false, isHighlighted: false, children: [] },
        { id: 113, name: 'About Us', url: '/about', icon: '', description: '', openNewTab: false, isHighlighted: false, children: [] },
        { id: 114, name: 'Contact', url: '/contact', icon: '', description: '', openNewTab: false, isHighlighted: false, children: [] },
      ],
    },
    {
      id: 102,
      name: 'Legal',
      url: '#',
      icon: '',
      description: '',
      openNewTab: false,
      isHighlighted: false,
      children: [
        { id: 121, name: 'Privacy Policy', url: '/privacy', icon: '', description: '', openNewTab: false, isHighlighted: false, children: [] },
        { id: 122, name: 'Terms of Service', url: '/terms', icon: '', description: '', openNewTab: false, isHighlighted: false, children: [] },
        { id: 123, name: 'Cookie Policy', url: '/cookies', icon: '', description: '', openNewTab: false, isHighlighted: false, children: [] },
      ],
    },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';

    const response = await fetch(`${odooUrl}/api/cms/navigation/${type}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return NextResponse.json({
          success: true,
          data: data.data,
        } as ApiResponse<CmsNavItem[]>);
      }
    }

    // Return defaults if Odoo unavailable
    const navItems = defaultNavigation[type] || [];
    return NextResponse.json({
      success: true,
      data: navItems,
    } as ApiResponse<CmsNavItem[]>);
  } catch (error) {
    console.warn('CMS navigation fetch failed, using defaults:', error);
    const { type } = await params;
    const navItems = defaultNavigation[type] || [];
    return NextResponse.json({
      success: true,
      data: navItems,
    } as ApiResponse<CmsNavItem[]>);
  }
}
