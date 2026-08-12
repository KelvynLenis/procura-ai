import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { getDeviceByImei } from "./get-device-by-imei";

describe("getDeviceByImei", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);

    process.env.NEXT_PUBLIC_API_URL = "https://appwrite.test/v1";
    process.env.NEXT_PUBLIC_DATABASE_ID = "databaseId";
    process.env.NEXT_PUBLIC_COLLECTION_DEVICE = "deviceCollection";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "projectId";
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("should return the devices when the request succeeds", async () => {
    const devices = [
      {
        $id: "device-1",
        imei: "123456789012345",
      },
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        documents: devices,
      }),
    });

    const result = await getDeviceByImei("123456789012345");

    expect(result).toEqual(devices);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/documents?"),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "projectId",
        },
      },
    );
  });

  it("should return an empty array when no devices are found", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    });

    const result = await getDeviceByImei("123456789012345");

    expect(result).toEqual([]);
  });

  it("should return an empty array when the request is not ok", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
    });

    const result = await getDeviceByImei("123456789012345");

    expect(result).toEqual([]);
  });

  it("should return an empty array when fetch throws an error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network error"));

    const result = await getDeviceByImei("123456789012345");

    expect(result).toEqual([]);
  });
});
