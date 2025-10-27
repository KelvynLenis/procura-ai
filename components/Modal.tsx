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
      <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto">
        <div className="bg-primary w-full flex gap-4 items-center text-white py-3 h-12 px-2">
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
