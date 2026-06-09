import { describe, it, expect, vi, beforeEach } from "vitest";

import { getDevices } from "../device/get-devices";
import { listEvents } from "../event/list-events";
import { getUser } from "../user/get-user";
import { listContacts } from "../contact/list-contacts";
import {
  joinDevicesEventsUsers,
  joinUsersDevicesEvents,
} from "./get-occurrences";

vi.mock("../device/get-devices", () => ({
  getDevices: vi.fn(),
}));

vi.mock("../event/list-events", () => ({
  listEvents: vi.fn(),
}));

vi.mock("../user/get-user", () => ({
  getUser: vi.fn(),
}));

vi.mock("../contact/list-contacts", () => ({
  listContacts: vi.fn(),
}));

describe("joinDevicesEventsUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar dispositivos enriquecidos", async () => {
    vi.mocked(getDevices).mockResolvedValue([
      {
        $id: "device-1",
        auth_id: "user-1",
        phone_model: "Galaxy S24",
      },
    ] as any);

    vi.mocked(listEvents).mockResolvedValue([
      {
        id_device: "device-1",
        description: "Roubo",
        $createdAt: "2025-01-01T10:00:00Z",
      },
    ] as any);

    vi.mocked(getUser).mockResolvedValue([
      {
        name: "João",
        email: "joao@email.com",
        cpf: "12345678900",
      },
    ] as any);

    vi.mocked(listContacts).mockResolvedValue([
      {
        name_contact: "Maria",
        email_contact: "maria@email.com",
      },
    ] as any);

    const result = await joinDevicesEventsUsers();

    expect(result).toEqual([
      {
        device: {
          $id: "device-1",
          auth_id: "user-1",
          phone_model: "Galaxy S24",
        },
        event: {
          id_device: "device-1",
          description: "Roubo",
          $createdAt: "2025-01-01T10:00:00Z",
        },
        user: {
          name: "João",
          email: "joao@email.com",
          cpf: "12345678900",
          emergency_contacts: [
            {
              name: "Maria",
              email: "maria@email.com",
            },
          ],
        },
      },
    ]);
  });

  it("deve retornar array vazio quando não houver dispositivos", async () => {
    vi.mocked(getDevices).mockResolvedValue([]);

    const result = await joinDevicesEventsUsers();

    expect(result).toEqual([]);
  });

  it("deve preencher dados padrão quando usuário não existir", async () => {
    vi.mocked(getDevices).mockResolvedValue([
      {
        $id: "device-1",
        auth_id: "user-1",
      },
    ] as any);

    vi.mocked(listEvents).mockResolvedValue([]);

    vi.mocked(getUser).mockResolvedValue([]);

    vi.mocked(listContacts).mockResolvedValue([]);

    const result = await joinDevicesEventsUsers();

    expect(result?.[0].user).toEqual({
      name: "Usuário excluído",
      email: "Sem email",
      cpf: "Sem CPF",
      emergency_contacts: [],
    });
  });

  it("deve retornar undefined quando ocorrer erro", async () => {
    vi.mocked(getDevices).mockRejectedValue(new Error("Erro"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await joinDevicesEventsUsers();

    expect(result).toBeUndefined();

    consoleSpy.mockRestore();
  });
});

describe("joinUsersDevicesEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve juntar usuários, dispositivos e eventos", async () => {
    vi.mocked(getUser)
      .mockResolvedValueOnce([
        {
          $id: "user-1",
        },
      ] as any)
      .mockResolvedValueOnce([
        {
          name: "João",
          email: "joao@email.com",
          cpf: "12345678900",
        },
      ] as any);

    vi.mocked(getDevices).mockResolvedValue([
      {
        $id: "device-1",
        auth_id: "user-1",
      },
    ] as any);

    vi.mocked(listEvents).mockResolvedValue([
      {
        id_device: "device-1",
        description: "Roubo",
        $createdAt: "2025-01-01T10:00:00Z",
      },
    ] as any);

    const result = await joinUsersDevicesEvents();

    expect(result).toEqual([
      {
        device: {
          $id: "device-1",
          auth_id: "user-1",
        },
        event: {
          id_device: "device-1",
          description: "Roubo",
          $createdAt: "2025-01-01T10:00:00Z",
        },
        user: {
          name: "João",
          email: "joao@email.com",
          cpf: "12345678900",
        },
      },
    ]);
  });

  it("deve usar valores padrão quando usuário não existir", async () => {
    vi.mocked(getUser)
      .mockResolvedValueOnce([
        {
          $id: "user-1",
        },
      ] as any)
      .mockResolvedValueOnce([]);

    vi.mocked(getDevices).mockResolvedValue([
      {
        $id: "device-1",
        auth_id: "user-1",
      },
    ] as any);

    vi.mocked(listEvents).mockResolvedValue([]);

    const result = await joinUsersDevicesEvents();

    expect(result[0].user).toEqual({
      name: "Usuário excluído",
      email: "Sem email",
      cpf: "Sem CPF",
    });
  });

  it("deve enviar filtros para getDevices", async () => {
    vi.mocked(getUser).mockResolvedValue([
      {
        $id: "user-1",
      },
    ] as any);

    vi.mocked(getDevices).mockResolvedValue([]);
    vi.mocked(listEvents).mockResolvedValue([]);

    const filters = [
      {
        method: "equal",
        attribute: "status",
        values: ["Roubado"],
      },
    ];

    await joinUsersDevicesEvents({
      devicesFilters: filters,
    });

    expect(getDevices).toHaveBeenCalledWith({
      filters: expect.arrayContaining(filters),
    });
  });
});
