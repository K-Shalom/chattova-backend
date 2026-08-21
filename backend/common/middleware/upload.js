// common/middleware/upload.js
//
// Configures multer to accept file uploads in memory (as a Buffer), which we
// then hand directly to MinIO — no temporary files written to disk.
// 25MB limit for now; can be tuned per attachment type later.

const multer = require('multer');
const AppError = require('../errors/AppError');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

function uploadSingleFile(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File is too large. Maximum size is 25MB.', 413, 'FILE_TOO_LARGE'));
        }
        return next(new AppError(err.message, 400, 'UPLOAD_ERROR'));
      }
      if (err) return next(err);
      if (!req.file) {
        return next(new AppError(`No file uploaded (expected field "${fieldName}").`, 422, 'NO_FILE'));
      }
      next();
    });
  };
}

module.exports = { uploadSingleFile };
