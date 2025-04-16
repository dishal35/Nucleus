import { StatusCodes } from "http-status-codes";
import sendResponse from "../utils/sendResponse.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Something went wrong";

  // Add any custom logging here if you want
  console.error("💥 Error:", {
    message,
    stack: err.stack,
    path: req.originalUrl,
  });

  return sendResponse(res, statusCode, false, message);
};

export default errorHandler;
