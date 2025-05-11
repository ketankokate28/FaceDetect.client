export interface Cctv {
    id: number;
    name: string;
    location: string | null;
    description: string | null;
    ipAddress: string | null;
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
    cameraType: string | null;
    cameraAngle: string | null;
    resolution: string | null;
    recordingStatus: string | null;
    storageDurationDays: number | null;
    installationDate: string | null;
    lastMaintenanceDate: string | null;
    status: string | null;
    lastActiveTimestamp: string | null;
    errorCount: number | null;
    autoRestart: boolean | null;
    isCritical: boolean | null;
    faceCropEnabled: boolean | null;
    frameMatchInterval: number | null;
    alertGroupId: number | null;
    siteId: number | null;
    zone: string | null;
    assignedGuard: number | null;
    cameraModel: string | null;
    videoDownloadLocation: string | null;
    streamUrl: string | null;
  }
  