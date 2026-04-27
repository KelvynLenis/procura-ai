import { create } from "zustand";

type DeviceStore = {
  hasCreatedANewDevice: boolean;

  setHasCreatedANewDevice: (value: boolean) => void;
};

export const useDeviceStore = create<DeviceStore>((set) => ({
  hasCreatedANewDevice: false,

  setHasCreatedANewDevice: (value) => set({ hasCreatedANewDevice: value }),
}));
