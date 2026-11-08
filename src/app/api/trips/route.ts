import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mockStore';

export async function GET() {
  return NextResponse.json({
    success: true,
    count: mockDb.trips.length,
    data: mockDb.trips,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newTrip = {
      ...body,
      id: 'trip-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    mockDb.trips.unshift(newTrip);
    return NextResponse.json({ success: true, data: newTrip });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Invalid payload' },
      { status: 400 }
    );
  }
}

