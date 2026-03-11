import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-navigate-to={to} />,
  };
});

import OffseasonRoutes from "@/pages/hub/offseason/OffseasonRoutes";

describe("OffseasonRoutes", () => {
  it("redirects legacy offseason free-agency path to canonical /free-agency route", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/offseason/free-agency"]}>
        <Routes>
          <Route path="/offseason/*" element={<OffseasonRoutes />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(html).toContain("/free-agency");
  });
});
