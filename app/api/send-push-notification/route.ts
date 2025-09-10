import { NextRequest, NextResponse } from 'next/server';
import { Expo } from 'expo-server-sdk'

export async function POST(req: NextRequest, res: NextResponse) {
  const expo = new Expo();

  const body = await req.json();

  const { pushToken, title, message } = body;


  const response = await expo.sendPushNotificationsAsync([
    { to: pushToken, sound: "default", body: message, title: title },
  ]);

  return NextResponse.json(response);
}
