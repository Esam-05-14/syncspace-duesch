export type DeviceNetwork = {
  online: boolean;
  label: string;
};

/** Device network only. Not a sync status and not “all changes saved”. */
export function describeDeviceNetwork(online: boolean): DeviceNetwork {
  return {
    online,
    label: online ? "This device has a network" : "This device is offline",
  };
}
