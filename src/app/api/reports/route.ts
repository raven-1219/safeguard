import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mockStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get('trip_id');

  const trip = tripId ? mockDb.trips.find((t) => t.id === tripId) : mockDb.trips[0];
  const driver = trip ? mockDb.profiles.find((p) => p.id === trip.driver_id) : mockDb.profiles[0];
  const vehicle = trip ? mockDb.vehicles.find((v) => v.id === trip.vehicle_id) : mockDb.vehicles[0];

  return NextResponse.json({
    success: true,
    report: {
      trip_id: trip?.id,
      route: trip?.route_name,
      driver_name: driver?.full_name,
      driver_email: driver?.email,
      vehicle_plate: vehicle?.plate_number,
      vehicle_make: vehicle?.make,
      vehicle_model: vehicle?.model,
      safety_score: trip?.final_safety_score || 96.0,
      total_drowsy_events: 1,
      total_distractions: 1,
      seatbelt_compliance: '100%',
      generated_at: new Date().toISOString(),
    },
  });
}

