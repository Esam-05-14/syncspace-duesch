import { describe, expect, it } from "vitest";
import { describeDeviceNetwork } from "../../apps/web/src/lib/network-status.js";

describe("device network label", () => {
  it("names the device network without claiming a save", () => {
    expect(describeDeviceNetwork(true).label).toBe("This device has a network");
    expect(describeDeviceNetwork(false)).toEqual({
      online: false,
      label: "This device is offline",
    });
    expect(describeDeviceNetwork(true).label.includes("saved")).toBe(false);
  });
});
