import { NextRequest, NextResponse } from 'next/server';
import { Expo } from 'expo-server-sdk'

export async function POST(req: NextRequest, res: NextResponse) {
  const expo = new Expo();

  const body = await req.json();

  const { pushToken, title, message } = body;

  console.log(pushToken)


  const response = await expo.sendPushNotificationsAsync([
    { to: pushToken, icon: '../../../assets/icons/logo-notification.png' , sound: "default", body: message, title: title, },
  ]);

  return NextResponse.json(response);
}
