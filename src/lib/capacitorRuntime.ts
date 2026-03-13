type UnknownModule = Record<string, unknown>;

async function loadCapacitorModule(path: string): Promise<UnknownModule | null> {
  try {
    return (await import(/* @vite-ignore */ path)) as UnknownModule;
  } catch {
    return null;
  }
}

export async function loadCapacitorPreferences() {
  return loadCapacitorModule("@capacitor/preferences");
}

export async function loadCapacitorHaptics() {
  return loadCapacitorModule("@capacitor/haptics");
}

export async function loadCapacitorFilesystem() {
  return loadCapacitorModule("@capacitor/filesystem");
}

export async function loadCapacitorShare() {
  return loadCapacitorModule("@capacitor/share");
}

