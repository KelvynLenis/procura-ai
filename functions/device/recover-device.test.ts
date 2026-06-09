// recover-device.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { recoverDevice } from "./recover-device";
import { createEvent } from "../event/create-event";
import { updateDeviceStatus } from "./update-device-status";

vi.mock("../event/create-event", () => ({
  createEvent: vi.fn(),
}));

vi.mock("./update-device-status", () => ({
  updateDeviceStatus: vi.fn(),
}));

describe("recoverDevice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve recuperar o dispositivo com sucesso", async () => {
    vi.mocked(createEvent).mockResolvedValue(true);
    vi.mocked(updateDeviceStatus).mockResolvedValue(true);

    const result = await recoverDevice("device-123");

    expect(result).toBe(true);

    expect(createEvent).toHaveBeenCalledTimes(1);

    expect(updateDeviceStatus).toHaveBeenCalledWith("device-123", {
      is_stolen: false,
      status: "Recuperado",
    });
  });

  it("deve criar o evento de recuperação corretamente", async () => {
    vi.mocked(createEvent).mockResolvedValue(true);
    vi.mocked(updateDeviceStatus).mockResolvedValue(true);

    await recoverDevice("device-123");

    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        id_device: "device-123",
        description: "Recuperado",
        type: "Recuperado",
        is_alert_on: false,
        id_district: "",
        last_location: [0, 0],
      }),
    );
  });

  it("deve retornar false quando falhar ao criar evento", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(createEvent).mockResolvedValue(false);

    const result = await recoverDevice("device-123");

    expect(result).toBe(false);

    expect(updateDeviceStatus).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve retornar false quando falhar ao atualizar dispositivo", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(createEvent).mockResolvedValue(true);
    vi.mocked(updateDeviceStatus).mockResolvedValue(false);

    const result = await recoverDevice("device-123");

    expect(result).toBe(false);

    expect(createEvent).toHaveBeenCalled();
    expect(updateDeviceStatus).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve retornar false quando createEvent lançar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(createEvent).mockRejectedValue(new Error("Erro ao criar evento"));

    const result = await recoverDevice("device-123");

    expect(result).toBe(false);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao recuperar dispositivo:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("deve retornar false quando updateDeviceStatus lançar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(createEvent).mockResolvedValue(true);

    vi.mocked(updateDeviceStatus).mockRejectedValue(
      new Error("Erro ao atualizar dispositivo"),
    );

    const result = await recoverDevice("device-123");

    expect(result).toBe(false);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao recuperar dispositivo:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
