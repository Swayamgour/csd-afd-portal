/**
 * Upload a set of { docType: File } and merge them over the documents that already exist on a demand.
 * Existing documents of a type are kept unless a new file of that type is supplied (replace).
 *
 * @param {Function} uploadFile  RTK mutation trigger from useUploadFileMutation()
 * @param {Array}    existing    demand.documents  ([{ type, name, url }])
 * @param {Object}   newFiles    { CANTEEN_CARD: File|null, PAN_COPY: File|null, ... }
 * @returns {Promise<Array>} merged documents array
 */
export async function uploadAndMergeDocuments(uploadFile, existing = [], newFiles = {}) {
  const byType = new Map();
  (existing || []).forEach((d) => d?.type && byType.set(d.type, d));

  for (const [docType, file] of Object.entries(newFiles)) {
    if (!file) continue;
    const fd = new FormData();
    fd.append('files', file);
    let item;
    try {
      const res = await uploadFile(fd).unwrap();
      item = Array.isArray(res) ? res[0] : res?.data?.[0];
    } catch {
      throw new Error(`Upload failed for ${file.name || docType}. Please retry.`);
    }
    if (!item?.url) throw new Error(`Upload failed for ${file.name || docType}. Please retry.`);
    byType.set(docType, { type: docType, name: file.name || docType, url: item.url });
  }
  return [...byType.values()];
}
