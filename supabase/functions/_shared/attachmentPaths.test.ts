import { describe, expect, it } from "vitest";
import { getWorkspaceScopedPathsToDelete } from "./attachmentPaths";

describe("getWorkspaceScopedPathsToDelete", () => {
  const workspaceId = "5b95dfc7-6b63-4f19-8a20-17f83c748f38";

  it("returns only removed attachment paths from the authorized workspace", () => {
    expect(
      getWorkspaceScopedPathsToDelete({
        bucketName: "attachments",
        workspaceId,
        payload: {
          type: "UPDATE",
          old_record: {
            workspace_id: workspaceId,
            attachments: [
              { path: `${workspaceId}/old.pdf` },
              { path: `${workspaceId}/kept.pdf` },
              { path: "other-workspace/old.pdf" },
            ],
          },
          record: {
            workspace_id: workspaceId,
            attachments: [{ path: `${workspaceId}/kept.pdf` }],
          },
        },
      }),
    ).toEqual([`${workspaceId}/old.pdf`]);
  });

  it("extracts storage paths from public URLs and rejects cross-workspace paths", () => {
    expect(
      getWorkspaceScopedPathsToDelete({
        bucketName: "attachments",
        workspaceId,
        payload: {
          type: "DELETE",
          old_record: {
            workspace_id: workspaceId,
            attachments: [
              {
                src: `https://example.supabase.co/storage/v1/object/public/attachments/${workspaceId}/from-url.png`,
              },
              {
                src: "https://example.supabase.co/storage/v1/object/public/attachments/11111111-1111-1111-1111-111111111111/nope.png",
              },
            ],
          },
        },
      }),
    ).toEqual([`${workspaceId}/from-url.png`]);
  });
});
