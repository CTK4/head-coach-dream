import { Link } from "react-router-dom";
import { routePath } from "@/lib/routes/appRoutes";
import type { HubState } from "@/lib/hub/mockHubState";

function Card(props: {
  kicker: string;
  title: string;
  subtitle: string;
  statusLabel?: string;
  priorityLabel?: string;
  primaryCta: { label: string; href: string };
  meta?: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/35">
      <div className="h-36 bg-gradient-to-r from-slate-800/60 to-slate-900/20" />
      <div className="p-4">
        <div className="text-xs uppercase tracking-widest text-slate-400">{props.kicker}</div>
        <div className="mt-1 text-2xl font-semibold">{props.title}</div>
        <div className="mt-1 text-sm text-slate-300">{props.subtitle}</div>

        {props.meta?.length ? (
          <div className="mt-4 space-y-2">
            {props.meta.map((m) => (
              <div
                key={m.label}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2 text-sm"
              >
                <div className="text-slate-400">{m.label}</div>
                <div className="font-semibold">{m.value}</div>
              </div>
            ))}
          </div>
        ) : null}

        {(props.statusLabel || props.priorityLabel) && (
          <div className="mt-4 space-y-2">
            {props.statusLabel ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2 text-sm">
                <div className="text-xs uppercase tracking-widest text-slate-400">STATUS</div>
                <div className="mt-1 font-semibold">{props.statusLabel}</div>
              </div>
            ) : null}
            {props.priorityLabel ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2 text-sm">
                <div className="text-xs uppercase tracking-widest text-slate-400">PRIORITY</div>
                <div className="mt-1 font-semibold">{props.priorityLabel}</div>
              </div>
            ) : null}
          </div>
        )}

        <Link to={props.primaryCta.href} className="mt-4 block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold">
          {props.primaryCta.label}
        </Link>
      </div>
    </div>
  );
}

export function HubCards({ hub }: { hub: HubState }) {
  const blockingItem = hub.actionItems.find((item) => item.blocking);

  return (
    <div className="mt-4 space-y-4">
      {blockingItem ? (
        <Link
          to={blockingItem.primaryCta.route}
          className="sticky top-2 z-10 block rounded-xl border border-red-400/40 bg-red-500/20 px-4 py-3 text-center text-sm font-bold text-red-100"
        >
          {blockingItem.title}: {blockingItem.primaryCta.label}
        </Link>
      ) : null}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/35 p-4">
        <div className="text-xs uppercase tracking-widest text-slate-400">Next Required Actions</div>
        <div className="mt-3 space-y-3">
          {hub.actionItems.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">{item.title}</div>
                <div
                  className={[
                    "rounded-full px-2 py-1 text-[11px] font-bold",
                    item.urgency === "Critical"
                      ? "bg-red-600/20 text-red-200"
                      : item.urgency === "High"
                        ? "bg-orange-600/20 text-orange-200"
                        : item.urgency === "Medium"
                          ? "bg-yellow-600/20 text-yellow-200"
                          : "bg-slate-700/40 text-slate-200",
                  ].join(" ")}
                >
                  {item.urgency}
                  {item.blocking ? " • Blocking" : ""}
                </div>
              </div>
              <div className="mt-1 text-sm text-slate-300">{item.description}</div>
              <div className="mt-3">
                <Link to={item.primaryCta.route} className="block rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold">
                  {item.primaryCta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card
          kicker="TEAM"
          title="NEW HEAD COACH"
          subtitle="Choose a new leader for your organization."
          statusLabel="Decision Needed"
          priorityLabel="Critical"
          primaryCta={{ label: "DECISION NEEDED", href: routePath("coachHiring") }}
        />

        <Card
          kicker="ROOKIE DRAFT"
          title="ROOKIE DRAFT"
          subtitle="Finalize your board and lock in top targets."
          meta={[
            { label: "ROUNDS", value: "1–7" },
            { label: "BEGINS IN", value: hub.draft.beginsInLabel },
            { label: "PICK", value: `#${hub.draft.nextPickOverall}` },
            { label: "WAR ROOM", value: "Ready" },
          ]}
          primaryCta={{ label: "BEGIN DRAFT", href: routePath("draftRoom") }}
        />

        <Card
          kicker="ROSTER MANAGEMENT"
          title="DEPTH CHART"
          subtitle="Roster move recommendations are ready to review."
          meta={[
            { label: "ROSTER HOLES", value: `${hub.roster.rosterHoles} Positions` },
            { label: "URGENCY", value: hub.roster.rosterHoles > 0 ? "Medium" : "Low" },
          ]}
          primaryCta={{ label: "EXPLORE", href: routePath("teamDepthChart") }}
        />

        <Card
          kicker="MARKET INTEL"
          title="FREE AGENCY PREVIEW"
          subtitle="Scout top available free agents before the bidding starts."
          meta={[
            { label: "TOP 1", value: hub.freeAgencyPreview.top3[0] },
            { label: "TOP 2", value: hub.freeAgencyPreview.top3[1] },
            { label: "TOP 3", value: hub.freeAgencyPreview.top3[2] },
            { label: "CLASS GRADE", value: hub.freeAgencyPreview.classGrade },
          ]}
          primaryCta={{ label: "EARLY LOOK", href: routePath("freeAgencyPreview") }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to={routePath("staff")} className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm font-semibold">
          Coaching Staff
        </Link>
        <Link
          to={routePath("scouting")}
          className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm font-semibold"
        >
          Scouting
        </Link>
      </div>
    </div>
  );
}
