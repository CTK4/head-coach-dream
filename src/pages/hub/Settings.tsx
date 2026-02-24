import { type ReactNode, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HubShell } from "@/components/franchise-hub/HubShell";
import { UtilityIcon } from "@/components/franchise-hub/UtilityIcon";
import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { readSettings, writeSettings } from "@/lib/settings";

type SimSpeed = "SLOW" | "NORMAL" | "FAST";
type Theme = "DARK" | "OLED";

type UserSettings = {
  simSpeed: SimSpeed;
  injuryNotifications: boolean;
  messagePopups: boolean;
  confirmAutoAdvance: boolean;
  reduceMotion: boolean;
  theme: Theme;
  useTop51CapRule: boolean;
  showTooltips: boolean;
};

const DEFAULT_SETTINGS: UserSettings = {
  simSpeed: "NORMAL",
  injuryNotifications: true,
  messagePopups: true,
  confirmAutoAdvance: true,
  reduceMotion: false,
  theme: "DARK",
  useTop51CapRule: false,
  showTooltips: true,
};


function hardResetApp() {
  try {
    localStorage.clear();
  } catch {
    // ignore
  }
  try {
    sessionStorage.clear();
  } catch {
    // ignore
  }
  window.location.href = "/";
}

function SettingRow({
  icon,
  title,
  description,
  right,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  right: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-300/15 bg-slate-950/20 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          {description ? <div className="text-xs text-slate-200/70">{description}</div> : null}
        </div>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<UserSettings>(() => ({ ...DEFAULT_SETTINGS, ...readSettings() }));
  const [confirmOpen, setConfirmOpen] = useState(false);

  const seasonLabel = useMemo(() => `${state.season}`, [state.season]);

  function update(patch: Partial<UserSettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      writeSettings(next);
      return next;
    });
  }

  function resetToDefaults() {
    setSettings(DEFAULT_SETTINGS);
    writeSettings(DEFAULT_SETTINGS);
  }

  function onResetConfirmed() {
    try {
      (dispatch as any)({ type: "RESET_GAME" });
    } catch {
      // ignore
    }
    setConfirmOpen(false);
    hardResetApp();
  }

  return (
    <HubShell title="SETTINGS">
      <div className="space-y-4">
        <Card className="border-slate-300/15 bg-slate-950/35">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <UtilityIcon name="Settings" className="h-5 w-5" />
              Settings
            </CardTitle>
            <div className="text-sm text-slate-200/70">Preferences are stored locally on this device.</div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Separator className="bg-slate-300/15" />

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-300/15 bg-slate-950/20 p-4">
                <div className="text-sm font-semibold text-slate-100">Profile</div>
                <div className="mt-1 text-xs text-slate-200/70">Season: {seasonLabel}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => navigate("/hub")}>
                    Back to Hub
                  </Button>
                  <Button variant="outline" onClick={resetToDefaults}>
                    Reset Preferences
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-slate-300/15 bg-slate-950/20 p-4">
                <div className="text-sm font-semibold text-slate-100">Icon Pack</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <UtilityIcon name="Messages" className="h-5 w-5" />
                  <UtilityIcon name="Issue" className="h-5 w-5" />
                  <UtilityIcon name="Calendar" className="h-5 w-5" />
                  <UtilityIcon name="Tag" className="h-5 w-5" />
                  <UtilityIcon name="Hot" className="h-5 w-5" />
                  <UtilityIcon name="Cold" className="h-5 w-5" />
                  <UtilityIcon name="Fatigued" className="h-5 w-5" />
                  <UtilityIcon name="Rested" className="h-5 w-5" />
                  <UtilityIcon name="IQ" className="h-5 w-5" />
                  <UtilityIcon name="High_Motor" className="h-5 w-5" />
                  <UtilityIcon name="Injured_Reserved" className="h-5 w-5" />
                  <UtilityIcon name="Lazy" className="h-5 w-5" />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-300/15" />

            <div className="space-y-3">
              <div className="text-sm font-semibold tracking-[0.12em] text-slate-100">GAMEPLAY</div>

              <SettingRow
                icon={<UtilityIcon name="Calendar" className="h-5 w-5" />}
                title="Sim Speed"
                description="Controls how fast sim/advance animations feel."
                right={
                  <Select value={settings.simSpeed} onValueChange={(v) => update({ simSpeed: v as SimSpeed })}>
                    <SelectTrigger className="h-9 w-[150px] border-slate-300/15 bg-slate-950/30 text-slate-100">
                      <SelectValue placeholder="Select speed" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-300/15 bg-slate-950 text-slate-100">
                      <SelectItem value="SLOW">Slow</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="FAST">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />

              <SettingRow
                icon={<UtilityIcon name="Issue" className="h-5 w-5" />}
                title="Injury Notifications"
                description="Show alerts when players are injured/IR."
                right={<Switch checked={settings.injuryNotifications} onCheckedChange={(checked) => update({ injuryNotifications: checked })} />}
              />

              <SettingRow
                icon={<UtilityIcon name="Messages" className="h-5 w-5" />}
                title="Message Popups"
                description="Show popups for news and messages."
                right={<Switch checked={settings.messagePopups} onCheckedChange={(checked) => update({ messagePopups: checked })} />}
              />


              <SettingRow
                icon={<UtilityIcon name="Messages" className="h-5 w-5" />}
                title="Badge Tooltips"
                description="Show hint legends when hovering badge bubbles in Hub views."
                right={<Switch checked={settings.showTooltips} onCheckedChange={(checked) => update({ showTooltips: checked })} />}
              />

              <SettingRow
                icon={<UtilityIcon name="Settings" className="h-5 w-5" />}
                title="Confirm Auto-Advance"
                description="Require confirmation before advancing to the next phase."
                right={<Switch checked={settings.confirmAutoAdvance} onCheckedChange={(checked) => update({ confirmAutoAdvance: checked })} />}
              />

              <SettingRow
                icon={<UtilityIcon name="Tag" className="h-5 w-5" />}
                title="Top-51 Cap Rule (Offseason)"
                description="Uses NFL-style Top-51 cap accounting during the offseason. During the regular season, cap is always calculated using all players (hard-locked)."
                right={<Switch checked={settings.useTop51CapRule} onCheckedChange={(checked) => update({ useTop51CapRule: checked })} />}
              />
            </div>

            <Separator className="bg-slate-300/15" />

            <div className="space-y-3">
              <div className="text-sm font-semibold tracking-[0.12em] text-slate-100">ACCESSIBILITY</div>

              <SettingRow
                icon={<UtilityIcon name="Cold" className="h-5 w-5" />}
                title="Reduce Motion"
                description="Disables some animations for comfort."
                right={<Switch checked={settings.reduceMotion} onCheckedChange={(checked) => update({ reduceMotion: checked })} />}
              />

              <SettingRow
                icon={<UtilityIcon name="Hot" className="h-5 w-5" />}
                title="Theme"
                description="OLED looks better on phones and reduces glow."
                right={
                  <Select value={settings.theme} onValueChange={(v) => update({ theme: v as Theme })}>
                    <SelectTrigger className="h-9 w-[150px] border-slate-300/15 bg-slate-950/30 text-slate-100">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-300/15 bg-slate-950 text-slate-100">
                      <SelectItem value="DARK">Dark</SelectItem>
                      <SelectItem value="OLED">OLED</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
            </div>

            <Separator className="bg-slate-300/15" />

            <div className="rounded-lg border border-red-500/25 bg-red-950/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-red-200">RESET GAME</div>
                  <div className="text-xs text-red-200/70">Local reset + reload. This deletes your current franchise on this device.</div>
                </div>
                <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                  Reset Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="border-slate-300/15 bg-slate-950 text-slate-100">
            <DialogHeader>
              <DialogTitle>Reset game?</DialogTitle>
              <DialogDescription className="text-slate-200/70">
                This action cannot be undone. Your local save will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onResetConfirmed}>
                Yes, Reset
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </HubShell>
  );
}
