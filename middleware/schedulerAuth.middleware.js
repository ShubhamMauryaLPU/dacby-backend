const ApiError = require('../utils/ApiError');

const schedulerSecretKey = process.env.SCHEDULER_SECRET_KEY;
function schedulerAuth(req, res, next) {
  const providedKey = req.headers['x-scheduler-secret'];
  if (!providedKey || providedKey !== schedulerSecretKey) {
    return next(new ApiError(401, 'Unauthorized: invalid or missing scheduler secret key'));
  }

  next();
}

module.exports = schedulerAuth;
