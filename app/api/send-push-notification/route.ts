import { NextRequest, NextResponse } from "next/server";
import { Expo } from "expo-server-sdk";
import { listAllUsers } from "@/functions/user/list-all-users";
import { createNotification } from "@/functions/notification/create-notification";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const expo = new Expo();

    const body = await req.json();

    const {
      pushToken,
      title,
      message,
      statusOptions,
      selectedTargets,
      locationOptions,
      isAllUsersChecked,
      targets,
    } = body;

    if (isAllUsersChecked) {
      const users = await listAllUsers();

      let messages = [];
      await createNotification({
        sender_id: undefined,
        receiver_id: users[0].user_id,
        message: message,
        is_read: false,
        type: "push",
        event_id: undefined,
        id_device: undefined,
        title: title,
        device_options: statusOptions,
        location_options: locationOptions,
        is_all_users_checked: isAllUsersChecked,
      });

      for (let user of users) {
        if (user.push_token) {
          messages.push({
            to: user.push_token,
            icon: "../../../assets/icons/logo-notification.png",
            sound: "default",
            body: message,
            title: title,
          });
        }
      }
      console.log(messages);

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

    await createNotification({
      sender_id: undefined,
      receiver_id: targets[0].id,
      message: message,
      is_read: false,
      type: "push",
      event_id: undefined,
      id_device: undefined,
      title: title,
      device_options: statusOptions,
      location_options: locationOptions,
      selected_targets: selectedTargets,
      is_all_users_checked: isAllUsersChecked,
    });

    for (let target of targets) {
      if (!Expo.isExpoPushToken(target.push_token)) {
        console.error(`Push token ${target} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: target.push_token,
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

    console.log(pushToken);

    const response = expo.chunkPushNotifications(messages);

    let tickets = [];

    (async () => {
      for (let chunk of response) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
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
