function success(res, data = null, message = "OK", statusCode = 200, meta = undefined) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {})
  });
}

function fail(res, message = "Something went wrong", statusCode = 500, errors = undefined) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {})
  });
}

module.exports = {
  success,
  fail
};
