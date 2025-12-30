import { NextRequest, NextResponse } from 'next/server';

// For demo: In-memory array (replace with DB/prisma in real usage)
const campaigns: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate minimal required fields
    if (!body.campaignName) {
      return NextResponse.json(
        { error: 'campaignName is required' },
        { status: 400 }
      );
    }
    // Add additional validation as needed

    // Save the campaign (replace with DB logic in real usage)
    const newCampaign = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    campaigns.push(newCampaign);

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  // List campaigns (for testing)
  return NextResponse.json({ campaigns });
}

