import type { DeviceProps } from "@/types";
import { ArrowLeft } from "lucide-react";

interface ModalProps {
  device?: DeviceProps;
  setModalOpen: (value: boolean) => void;
  setDevices?: React.Dispatch<React.SetStateAction<DeviceProps[]>>;
  handleDeleteDevice?: (id: string) => void;
  handleDeviceRecovery?: (id: string) => Promise<void>;
  title?: string;
  children?: React.ReactNode;
}

export function Modal({
  device,
  setModalOpen,
  setDevices,
  handleDeleteDevice,
  handleDeviceRecovery,
  title,
  children,
}: ModalProps) {
  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white">
        <div className="flex h-12 w-full items-center gap-4 bg-primary px-2 py-3 text-white">
          <button type="button" onClick={() => setModalOpen(false)}>
            <ArrowLeft size={24} className="cursor-pointer" />
          </button>
          {title && <>{title}</>}
        </div>
        <div className="flex flex-col gap-1 pr-5">{children}</div>
      </div>
    </>
  );
}
