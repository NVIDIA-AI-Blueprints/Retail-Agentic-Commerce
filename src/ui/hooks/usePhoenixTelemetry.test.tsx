import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchPhoenixAgentPerformance } from "./usePhoenixTelemetry";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("fetchPhoenixAgentPerformance", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches spans per project and aggregates top-level spans only", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/v1/projects") && !url.includes("/spans")) {
        return jsonResponse({
          data: [
            { id: "proj_promo", name: "promotion-agent" },
            { id: "proj_reco", name: "arag-recommendations-ultrafast" },
            { id: "proj_post", name: "post-purchase-agent" },
            { id: "proj_search", name: "search-agent" },
          ],
        });
      }

      if (url.includes("/projects/proj_promo/spans")) {
        return jsonResponse({
          data: [
            {
              context: { trace_id: "t1", span_id: "s1" },
              name: "<workflow>",
              parent_id: null,
              start_time: "2026-02-05T10:00:00.000Z",
              end_time: "2026-02-05T10:00:00.100Z",
              status_code: "OK",
            },
            {
              context: { trace_id: "t1", span_id: "s2" },
              name: "<child>",
              parent_id: "s1",
              start_time: "2026-02-05T10:00:00.010Z",
              end_time: "2026-02-05T10:00:00.020Z",
              status_code: "ERROR",
            },
          ],
          next_cursor: null,
        });
      }

      if (url.includes("/projects/proj_reco/spans")) {
        return jsonResponse({ data: [], next_cursor: null });
      }

      if (url.includes("/projects/proj_post/spans")) {
        return jsonResponse({
          data: [
            {
              context: { trace_id: "t2", span_id: "s3" },
              name: "<workflow>",
              parent_id: null,
              start_time: "2026-02-05T10:00:00.000Z",
              end_time: "2026-02-05T10:00:00.050Z",
              status_code: "ERROR",
            },
          ],
          next_cursor: null,
        });
      }

      if (url.includes("/projects/proj_search/spans")) {
        return jsonResponse({
          data: [
            {
              context: { trace_id: "t3", span_id: "s4" },
              name: "<workflow>",
              parent_id: null,
              start_time: "2026-02-05T10:00:00.000Z",
              end_time: "2026-02-05T10:00:00.030Z",
              status_code: "OK",
            },
            {
              context: { trace_id: "t4", span_id: "s5" },
              name: "<workflow>",
              parent_id: null,
              start_time: "2026-02-05T10:01:00.000Z",
              end_time: "2026-02-05T10:01:00.030Z",
              status_code: "OK",
            },
          ],
          next_cursor: null,
        });
      }

      return jsonResponse({}, 404);
    });

    vi.stubGlobal("fetch", fetchMock);

    const data = await fetchPhoenixAgentPerformance("24h");

    expect(data).toHaveLength(4);
    expect(data.find((item) => item.agentType === "promotion")?.totalCalls).toBe(1);
    expect(data.find((item) => item.agentType === "promotion")?.avgLatency).toBe(100);
    expect(data.find((item) => item.agentType === "recommendation")?.totalCalls).toBe(0);
    expect(data.find((item) => item.agentType === "post_purchase")?.errors).toBe(0);
    expect(data.find((item) => item.agentType === "post_purchase")?.successRate).toBeNull();
    expect(data.find((item) => item.agentType === "search")?.avgLatency).toBe(30);

    const calledUrls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(calledUrls.some((url) => url.includes("/spans?"))).toBe(true);
    expect(calledUrls.some((url) => url.includes("start_time="))).toBe(true);
    expect(calledUrls.some((url) => url.includes("end_time="))).toBe(true);
  });

  it("throws when project listing fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ error: "boom" }, 500))
    );

    await expect(fetchPhoenixAgentPerformance("24h")).rejects.toThrow(
      "Failed to fetch Phoenix projects"
    );
  });
});
