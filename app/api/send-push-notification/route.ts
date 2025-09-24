import { NextRequest, NextResponse } from 'next/server';
import { Expo } from 'expo-server-sdk'
import { listAllUsers } from '@/functions/user/list-all-users';

export async function POST(req: NextRequest, res: NextResponse) {
  const expo = new Expo();

  const body = await req.json();

  const { pushToken, title, message, statusOptions, locationOptions, allUsers, targets } = body;

  if (allUsers) {
    const users = await listAllUsers();

    let messages = [];

    for (let user of users) {
      if (user.push_token) {
        messages.push(
          { 
            to: user.push_token, 
            icon: '../../../assets/icons/logo-notification.png' , 
            sound: "default", 
            body: message, 
            title: title, 
          },
        );
        // console.log(user)
        //  const response = await expo.sendPushNotificationsAsync([
        //     { to: user.push_token, icon: '../../../assets/icons/logo-notification.png' , sound: "default", body: message, title: title, },
        //   ]);
      }
    }
    console.log(messages)

    const chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    (async () => {
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(error);
        }
      }
    })();

    // console.log(response)

    return NextResponse.json({ success: true });
  }

  let messages = [];

  for (let target of targets) {
    if (!Expo.isExpoPushToken(target)) {
      console.error(`Push token ${target} is not a valid Expo push token`);
      continue;
    }

    messages.push(
      { 
        to: target, 
        icon: '../../../assets/icons/logo-notification.png' , 
        sound: "default", 
        body: message, 
        title: title, 
        data: {
          screen: "/my-devices",
          teste: 'teste'
        }
      },
    )
  }

  // console.log(pushToken)

  // const response = await expo.sendPushNotificationsAsync([
  //   { to: pushToken, icon: '../../../assets/icons/logo-notification.png' , sound: "default", body: message, title: title, data: { screen: "/my-devices", teste: 'teste' } },
  // ]);

  const response = expo.chunkPushNotifications(messages);

  console.log(response)

  return NextResponse.json(response);
}
