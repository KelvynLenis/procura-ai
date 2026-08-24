import { NextRequest, NextResponse } from "next/server";
import { Expo } from "expo-server-sdk";
import { listAllUsers } from "@/functions/user/list-all-users";
import { createNotification } from "@/functions/notification/create-notification";
import { getUser } from "@/functions/user/get-user";
import { getDevices } from "@/functions/device/get-devices";
import { getUserById } from "@/functions/user/get-user-by-id";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const expo = new Expo();

    const body = await req.json();

    const { title, message, requesterId } = body;

    let messages = [];

    const requesterUser = await getUserById(requesterId);

    if (!requesterUser?.push_token) return;

    for (let push_token of requesterUser?.push_token) {
      if (!Expo.isExpoPushToken(push_token)) {
        console.error(
          `Push token ${push_token} is not a valid Expo push token`,
        );
        continue;
      }

      messages.push({
        to: push_token,
        icon: "../../../assets/icons/logo-notification.png",
        sound: "default",
        body: message,
        title: title,
        data: {
          screen: "/my-devices",
          teste: "teste",
        },
      });
    }

    const response = expo.chunkPushNotifications(messages);

    let tickets = [];

    (async () => {
      for (let chunk of response) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          // console.log(ticketChunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(error);
        }
      }
    })();

    // const response = await expo.sendPushNotificationsAsync([
    //   { to: pushToken, icon: '../../../assets/icons/logo-notification.png' , sound: "default", body: message, title: title, data: { screen: "/my-devices", teste: 'teste' } },
    // ]);

    console.log(response);

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
