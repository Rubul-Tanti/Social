import { RequestHandler } from "express";
export const requestLogger:RequestHandler = (
  req,res,
  next
) => {
  try {
    const date = new Date();
    const url = req.originalUrl;
    const method = req.method;
    const device = req.get("user-agent");
    const time = date.toLocaleString();

    console.log(
      ` ${method} ${url} | Device: ${device} | Time: ${time}`
    );

    next();
  } catch (e) {
    console.error("Logger error:", e);
    next();
  }
};