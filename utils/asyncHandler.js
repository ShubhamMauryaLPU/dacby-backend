// Wraps async controller functions so rejected promises are forwarded to
// Express's error-handling middleware instead of crashing the process
// or requiring a try/catch block in every single controller.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
