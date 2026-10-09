export interface DeviceFile {
    publicId: string;
    description: string;
    type: DeviceFileType;
    url: string;
    main: string;
    index: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export const DEVICE_FILE_TYPES = {
    image: 'image',
    video: 'video',
    pdf: 'pdf',
};

export type DeviceFileType = keyof typeof DEVICE_FILE_TYPES;
