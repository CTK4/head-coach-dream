import { describe, expect, it } from "vitest";
import { clearAppOwnedStorage } from "@/pages/hub/Settings";

function createStorage(seed: Record<string, string>): Storage {
  const store = new Map(Object.entries(seed));
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe("clearAppOwnedStorage", () => {
  it("removes app-owned local/session keys", () => {
    const local = createStorage({
      hc_career_save: "save",
      hc_career_active_save_id: "slot-1",
      hc_career_saves_index: "[]",
      "hc_career_save__slot-1": "save",
      "hc_career_save__slot-1__bak": "backup",
      "hc_career_save__slot-1__tmp": "temp",
      "hcd:settings": "settings",
      hapticsEnabled: "true",
      DEV_PANEL: "1",
      unrelated: "leave-me",
    });
    const session = createStorage({
      show_main_menu: "1",
      "hcd:lastRoute": "/hub",
      "hc_temp": "1",
      analytics_session: "keep",
    });

    clearAppOwnedStorage(local, session);

    expect(local.getItem("hc_career_save")).toBeNull();
    expect(local.getItem("hc_career_active_save_id")).toBeNull();
    expect(local.getItem("hc_career_saves_index")).toBeNull();
    expect(local.getItem("hc_career_save__slot-1")).toBeNull();
    expect(local.getItem("hc_career_save__slot-1__bak")).toBeNull();
    expect(local.getItem("hc_career_save__slot-1__tmp")).toBeNull();
    expect(local.getItem("hcd:settings")).toBeNull();
    expect(local.getItem("hapticsEnabled")).toBeNull();
    expect(local.getItem("DEV_PANEL")).toBeNull();
    expect(session.getItem("show_main_menu")).toBeNull();
    expect(session.getItem("hcd:lastRoute")).toBeNull();
    expect(session.getItem("hc_temp")).toBeNull();
    expect(local.getItem("unrelated")).toBe("leave-me");
    expect(session.getItem("analytics_session")).toBe("keep");
  });

  it("preserves non-app keys", () => {
    const local = createStorage({
      firebase: "abc",
      featureFlag: "on",
      another: "value",
    });
    const session = createStorage({
      authToken: "secret",
      thirdparty: "ok",
    });

    clearAppOwnedStorage(local, session);

    expect(local.getItem("firebase")).toBe("abc");
    expect(local.getItem("featureFlag")).toBe("on");
    expect(local.getItem("another")).toBe("value");
    expect(session.getItem("authToken")).toBe("secret");
    expect(session.getItem("thirdparty")).toBe("ok");
  });
});
