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

    // console.log("statusTarget", statusTarget);
    // console.log("locationTarget", locationTarget);

    const queryFiltersLocation =
      locationTarget.length > 0
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

    // console.log("usersFromLocationOptions", usersFromLocationOptions.length);

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

    // console.log("selectedUsers", selectedUsers.length);

    const mergeTargets = [...selectedUsers, ...targetUsersFromStatusOptions];

    // console.log("mergeTargets", mergeTargets.length);

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

    const removeAdmin = removeDuplicated.filter(
      (user) => user.type !== "Administrador",
    );

    // console.log("removeDuplicated", removeAdmin.length);

    const removeUserWithoutToken = removeAdmin.filter(
      (user) => user.push_token.length > 0,
    );

    // console.log("removeUserWithoutToken", removeUserWithoutToken.length);

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
