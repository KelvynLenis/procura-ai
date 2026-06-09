import { NextRequest, NextResponse } from "next/server";
import { Expo } from "expo-server-sdk";
import { listAllUsers } from "@/functions/user/list-all-users";
import { createNotification } from "@/functions/notification/create-notification";
import { getUser } from "@/functions/user/get-user";
import { getDevices } from "@/functions/device/get-devices";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const expo = new Expo();

    const body = await req.json();

    const {
      pushToken,
      title,
      message,
      statusOptions,
      selectedUsers,
      locationOptions,
      isAllUsersChecked,
      // targets,
    } = body;

    const statusTarget = Object.keys(statusOptions).filter(
      (key) => statusOptions[key] === true,
    );

    const locationTarget = Object.keys(locationOptions).filter(
      (key) => locationOptions[key] === true,
    );

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
        device_options: statusTarget,
        location_options: locationTarget,
        is_all_users_checked: isAllUsersChecked,
      });

      for (let user of users) {
        if (user.push_token) {
          for (let push_token of user.push_token) {
            messages.push({
              to: push_token,
              icon: "../../../assets/icons/logo-notification.png",
              sound: "default",
              body: message,
              title: title,
            });
          }
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

    const selectedTargetsId = selectedUsers.map((user) => user.user_id);

    // console.log("locationTarget", locationTarget);

    const queryFiltersLocation =
      locationOptions.length > 0
        ? [
            {
              method: "equal",
              attribute: "city",
              values: locationTarget,
            },
          ]
        : [];

    const usersFromLocationOptions = await getUser({
      filters: queryFiltersLocation,
    });

    const queryFiltersDevices =
      statusTarget.length > 0
        ? [
            {
              method: "equal",
              attribute: "status",
              values: statusTarget,
            },
          ]
        : [];

    const allStatusDeviceSource =
      queryFiltersDevices.length > 0
        ? await getDevices({ filters: queryFiltersDevices })
        : [];

    const deviceUserTargets = allStatusDeviceSource.map(
      (device) => device.auth_id,
    );

    // console.log("deviceUserTargets", deviceUserTargets);

    const queryFiltersUsers =
      deviceUserTargets.length > 0
        ? [
            {
              method: "equal",
              attribute: "user_id",
              values: deviceUserTargets,
            },
          ]
        : [];

    const targetUsersFromStatusOptions =
      queryFiltersUsers.length > 0
        ? await getUser({ filters: queryFiltersUsers })
        : [];

    // console.log("targetUsersFromStatusOptions", targetUsersFromStatusOptions);

    const mergeTargets = [...selectedUsers, ...targetUsersFromStatusOptions];

    const mergeTargetsWithLocation = [
      ...mergeTargets,
      ...usersFromLocationOptions,
    ];

    const removeDuplicated = mergeTargetsWithLocation.filter((value, index) => {
      const _value = JSON.stringify(value);
      return (
        index ===
        mergeTargetsWithLocation.findIndex((obj) => {
          return JSON.stringify(obj) === _value;
        })
      );
    });

    console.log("removeDuplicated", removeDuplicated.length);

    const removeAdmin = removeDuplicated.filter(
      (user) => user.type !== "Administrador",
    );

    const removeUserWithoutToken = removeAdmin.filter(
      (user) => user.push_token.length > 0,
    );

    console.log("removeUserWithoutToken", removeUserWithoutToken.length);

    const targets = removeUserWithoutToken.map((user) => {
      return { id: user.user_id, push_token: user.push_token };
    });

    for (let target of targets) {
      for (let push_token of target.push_token) {
        if (!Expo.isExpoPushToken(push_token)) {
          console.error(`Push token ${target} is not a valid Expo push token`);
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
    }

    // console.log(pushToken);

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

    // console.log("targets", targets);

    await createNotification({
      sender_id: undefined,
      message: message,
      is_read: false,
      type: "push",
      event_id: undefined,
      id_device: undefined,
      title: title,
      device_options: statusTarget,
      location_options: locationTarget,
      selected_targets: selectedTargetsId,
      is_all_users_checked: isAllUsersChecked,
    });

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
