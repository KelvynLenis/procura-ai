import { NextRequest, NextResponse } from 'next/server';
import { Expo } from 'expo-server-sdk'

export async function POST(req: NextRequest, res: NextResponse) {
  const expo = new Expo();

  const body = await req.json();

  const { pushToken, title, message } = body;


  const response = await expo.sendPushNotificationsAsync([
    { to: pushToken, icon: '../../../assets/icons/logo-black.png' , sound: "default", body: message, title: title, richContent: {
      image: 'https://template.canva.com/EAE1YAgPM_U/1/0/400w-R-Meu_EcnME.jpg'
    }, },
  ]);

  return NextResponse.json(response);
}
