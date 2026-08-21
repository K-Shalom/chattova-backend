// modules/attachments/dto.js

function toAttachment(row) {
  return {
    id: row.id,
    messageId: row.message_id,
    filename: row.filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    storageUrl: row.storage_url,
    checksum: row.checksum,
    createdAt: row.created_at,
  };
}

module.exports = { toAttachment };
