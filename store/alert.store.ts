import { create } from "zustand";

type AlertStore = {
  hasCreatedANewAlert: boolean;

  setHasCreatedANewAlert: (value: boolean) => void;
};

export const useAlertStore = create<AlertStore>((set) => ({
  hasCreatedANewAlert: false,

  setHasCreatedANewAlert: (value) => set({ hasCreatedANewAlert: value }),
}));
