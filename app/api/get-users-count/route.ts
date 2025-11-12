import { NextRequest, NextResponse } from "next/server";
import { Expo } from "expo-server-sdk";
import { listAllUsers } from "@/functions/user/list-all-users";
import { createNotification } from "@/functions/notification/create-notification";
import { getDevices } from "@/functions/devices/list-devices";
import { getUser } from "@/functions/user/get-user";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json();

    const { statusOptions, selectedUsers, locationOptions, isAllUsersChecked } =
      body;

    if (isAllUsersChecked) {
      const userFilters = {
        method: "isNotNull",
        attribute: "push_token",
        values: [],
      };

      const usersList = await getUser({ filters: [userFilters] });

      const removeEmpty = usersList.filter(
        (user) =>
          user?.push_token?.length !== undefined &&
          user?.push_token?.length > 0,
      );

      // console.log("response", usersList.length);
      return NextResponse.json(removeEmpty.length);
    }

    const statusTarget = Object.keys(statusOptions).filter(
      (key) => statusOptions[key] === true,
    );

    const locationTarget = Object.keys(locationOptions).filter(
      (key) => locationOptions[key] === true,
    );

    console.log("statusTarget", statusTarget);

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

    // console.log("selectedUsers", selectedUsers);

    const mergeTargets = [...selectedUsers, ...targetUsersFromStatusOptions];

    const removeDuplicated = mergeTargets.filter((value, index) => {
      const _value = JSON.stringify(value);
      return (
        index ===
        mergeTargets.findIndex((obj) => {
          return JSON.stringify(obj) === _value;
        })
      );
    });

    const removeAdmin = removeDuplicated.filter(
      (user) => user.type !== "Administrador",
    );

    const removeUserWithoutToken = removeAdmin.filter(
      (user) => user.push_token.length > 0,
    );

    // console.log("targets", removeUserWithoutToken);

    const targets = removeUserWithoutToken.map((user) => {
      return { id: user.user_id, push_token: user.push_token };
    });

    // console.log("targets", targets.length);

    // console.log("statusTarget", statusTarget);

    // const selectedTargetsId = selectedUsers.map((user) => user.user_id);

    return NextResponse.json(targets.length);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
