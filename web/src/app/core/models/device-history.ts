export interface DeviceHistory {
    id: number;
    deviceId: number;
    userId: number;
    user?: { name: string };
    date: Date;
    description: string;
}
