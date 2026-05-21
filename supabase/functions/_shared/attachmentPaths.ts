type NoteAttachment = {
  path?: string | null;
  src?: string | null;
};

type NoteRecord = {
  id?: number | string | null;
  workspace_id?: string | null;
  attachments?: NoteAttachment[] | null;
};

export type AttachmentWebhookPayload = {
  type?: string | null;
  old_record?: NoteRecord | null;
  record?: NoteRecord | null;
};

export const getPayloadWorkspaceId = (
  payload: AttachmentWebhookPayload,
): string | null => {
  return (
    payload.record?.workspace_id ?? payload.old_record?.workspace_id ?? null
  );
};

export const getWorkspaceScopedPathsToDelete = ({
  bucketName,
  payload,
  workspaceId,
}: {
  bucketName: string;
  payload: AttachmentWebhookPayload;
  workspaceId: string;
}): string[] => {
  const oldPaths = extractAttachmentPaths(
    payload.old_record?.attachments,
    bucketName,
    workspaceId,
  );
  const newPaths = extractAttachmentPaths(
    payload.record?.attachments,
    bucketName,
    workspaceId,
  );

  if (payload.type === "UPDATE") {
    const newPathsSet = new Set(newPaths);
    return oldPaths.filter((path) => !newPathsSet.has(path));
  }

  if (payload.type === "DELETE") {
    return oldPaths;
  }

  return [];
};

const extractAttachmentPaths = (
  attachments: NoteAttachment[] | null | undefined,
  bucketName: string,
  workspaceId: string,
): string[] => {
  const paths = attachments
    ?.map((attachment) => extractAttachmentPath(attachment, bucketName))
    .filter((path): path is string => path != null && path.length > 0)
    .filter((path) => path.startsWith(`${workspaceId}/`));

  return paths ? Array.from(new Set(paths)) : [];
};

const extractAttachmentPath = (
  attachment: NoteAttachment | null | undefined,
  bucketName: string,
) => {
  if (!attachment) {
    return null;
  }

  if (attachment.path) {
    return normalizeStoragePath(attachment.path, bucketName);
  }

  if (!attachment.src) {
    return null;
  }

  const pathname = getPathname(attachment.src);
  if (!pathname) {
    return null;
  }

  const bucketSegment = `/${bucketName}/`;
  const bucketIndex = pathname.lastIndexOf(bucketSegment);
  if (bucketIndex < 0) {
    return null;
  }

  const path = pathname.slice(bucketIndex + bucketSegment.length);
  return normalizeStoragePath(path, bucketName);
};

const getPathname = (value: string) => {
  try {
    return new URL(value, "http://localhost").pathname;
  } catch {
    return null;
  }
};

const safelyDecodePath = (path: string) => {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
};

const normalizeStoragePath = (path: string, bucketName: string) => {
  const trimmedPath = path.trim();
  if (trimmedPath.length === 0) {
    return null;
  }

  const parsedPath = getPathname(trimmedPath);
  const candidatePath = parsedPath ?? trimmedPath;

  const bucketSegment = `/${bucketName}/`;
  const bucketIndex = candidatePath.lastIndexOf(bucketSegment);
  const withoutBucket =
    bucketIndex >= 0
      ? candidatePath.slice(bucketIndex + bucketSegment.length)
      : candidatePath
          .replace(/^\/+/, "")
          .replace(new RegExp(`^${bucketName}/`), "");

  if (withoutBucket.length === 0) {
    return null;
  }

  return safelyDecodePath(withoutBucket);
};
