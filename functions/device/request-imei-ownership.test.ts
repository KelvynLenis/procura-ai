import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { requestImeiOwnership } from "./request-imei-ownership";
import { getUserId } from "../user/get-user-id";
import { getUserById } from "../user/get-user-by-id";

vi.mock("../user/get-user-id", () => ({
  getUserId: vi.fn(),
}));

vi.mock("../user/get-user-by-id", () => ({
  getUserById: vi.fn(),
}));

describe("requestImeiOwnership", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);

    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";

    vi.mocked(getUserId).mockResolvedValue("user-123");
    vi.mocked(getUserById).mockResolvedValue({
      name: "João",
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("should return isValid=true when the request succeeds", async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        status: "success",
      }),
    });

    const result = await requestImeiOwnership("123456789012345");

    expect(result).toEqual({
      isValid: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/api/request-device-ownership",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imei: "123456789012345",
          newOwnerName: "João",
        }),
      },
    );
  });

  it("should return an error when the api returns status different from success", async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        status: "error",
      }),
    });

    const result = await requestImeiOwnership("123456789012345");

    expect(result).toEqual({
      isValid: false,
      isError: true,
      error:
        "Erro ao solicitar a transferência de proprietário. Por favor, tente novamente mais tarde.",
    });
  });

  it("should return an error when fetch throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network error"));

    const result = await requestImeiOwnership("123456789012345");

    expect(result).toEqual({
      isValid: false,
      isError: true,
      error: "Erro ao verificar IMEI. Por favor, tente novamente mais tarde.",
    });
  });

  it("should call getUserId and getUserById", async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        status: "success",
      }),
    });

    await requestImeiOwnership("123456789012345");

    expect(getUserId).toHaveBeenCalledTimes(1);
    expect(getUserById).toHaveBeenCalledWith("user-123");
  });
});
