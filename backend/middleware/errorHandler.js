const { ZodError } = require("zod");
const env = require("../config/env");
const { fail } = require("../utils/apiResponse");

function errorHandler(error, req, res, next) {
  if (error instanceof ZodError) {
    return fail(
      res,
      "Validation failed",
      422,
      error.errors.map((item) => ({
        field: item.path.join("."),
        message: item.message
      }))
    );
  }

  if (error.code === "ER_DUP_ENTRY") {
    return fail(res, "A record with this value already exists", 409);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : "Internal server error";

  if (env.nodeEnv !== "test") {
    console.error(error);
  }

  return fail(
    res,
    message,
    statusCode,
    env.nodeEnv === "production" ? undefined : error.errors || error.stack
  );
}

module.exports = errorHandler;
