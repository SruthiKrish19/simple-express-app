const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const path = require("path");
const fs = require("fs");
const fsPromises = fs.promises;

const eventsLogger = async (message, logName) => {
  const dateTime = format(new Date(), "dd-MMM-yyyy HH:mm:ss");
  const logMessage = `${dateTime}\t${uuid()}\t${message}\n`;
  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(path.join(__dirname, "..", "logs", logName), logMessage);
  } catch (error) {
    console.log("Events Logger:", error);
  }
};

const expressLogger = async (req, res, next) => {
  eventsLogger(`${req.method}\t${req.headers.origin}\t${req.url}`, "requestLogs.txt")
  next();
}

module.exports = { eventsLogger, expressLogger };
