import morgan from "morgan";
import logger from "../utils/logger.utils";

// Create a stream object for Morgan to use Winston
const stream = {
  write: (message: string) => logger.http(message.trim()), // Trim the newline
};

const morganMiddleware = morgan("dev", { stream });

export default morganMiddleware;
