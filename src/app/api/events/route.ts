import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mockStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get('driver_id');
  const severity = searchParams.get('severity');

  let events = [...mockDb.monitoringEvents];
  if (driverId) {
    events = events.filter((e) => e.driver_id === driverId);
  }
  if (severity) {
    events = events.filter((e) => e.severity === severity);
  }

  return NextResponse.json({
    success: true,
    count: events.length,
    data: events.slice(0, 50),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = mockDb.addMonitoringEvent(body);
    return NextResponse.json({ success: true, data: event });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Invalid request' },
      { status: 400 }
    );
  }
}

