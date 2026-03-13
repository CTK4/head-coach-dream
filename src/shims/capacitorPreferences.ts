export type ConfigureOptions = {
  group?: string;
};

export type GetOptions = {
  key: string;
};

export type SetOptions = {
  key: string;
  value: string;
};

export type RemoveOptions = {
  key: string;
};

export type GetResult = {
  value: string | null;
};

const storage = {
  getItem: (key: string) => {
    if (typeof globalThis.localStorage === "undefined") return null;
    return globalThis.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof globalThis.localStorage === "undefined") return;
    globalThis.localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof globalThis.localStorage === "undefined") return;
    globalThis.localStorage.removeItem(key);
  },
};

export const Preferences = {
  async configure(_options: ConfigureOptions): Promise<void> {
    return Promise.resolve();
  },

  async get(options: GetOptions): Promise<GetResult> {
    return { value: storage.getItem(options.key) };
  },

  async set(options: SetOptions): Promise<void> {
    storage.setItem(options.key, options.value);
  },

  async remove(options: RemoveOptions): Promise<void> {
    storage.removeItem(options.key);
  },
};
