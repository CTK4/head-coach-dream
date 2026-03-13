declare module "@capacitor/preferences" {
  export const Preferences: {
    get(options: { key: string }): Promise<{ value: string | null }>;
    set(options: { key: string; value: string }): Promise<void>;
    remove(options: { key: string }): Promise<void>;
    clear(): Promise<void>;
  };
}

declare module "@capacitor/filesystem" {
  export const Directory: Record<string, string>;
  export const Encoding: Record<string, string>;
  export const Filesystem: {
    mkdir(options: Record<string, unknown>): Promise<void>;
    writeFile(options: Record<string, unknown>): Promise<void>;
    getUri(options: Record<string, unknown>): Promise<{ uri: string }>;
    deleteFile(options: Record<string, unknown>): Promise<void>;
  };
}

declare module "@capacitor/haptics" {
  export const ImpactStyle: Record<string, string>;
  export const NotificationType: Record<string, string>;
  export const Haptics: {
    impact(options: Record<string, unknown>): Promise<void>;
    notification(options: Record<string, unknown>): Promise<void>;
    vibrate(options?: Record<string, unknown>): Promise<void>;
    selectionStart(): Promise<void>;
    selectionChanged(): Promise<void>;
    selectionEnd(): Promise<void>;
  };
}

declare module "@capacitor/share" {
  export const Share: {
    share(options: Record<string, unknown>): Promise<void>;
  };
}
