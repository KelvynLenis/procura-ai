export const DEVICES_CHANGED_EVENT = "procuraai:devices-changed";

export type DevicesChangedDetail = {
  deviceId: string;
  status: string;
  is_stolen: boolean;
};

export function notifyDevicesChanged(detail?: DevicesChangedDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<DevicesChangedDetail | undefined>(DEVICES_CHANGED_EVENT, {
      detail,
    }),
  );
}
