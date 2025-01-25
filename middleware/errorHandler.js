const { eventsLogger } = require("./eventsLogger")

const errorHandler = (err, req, res, next) => {
    eventsLogger(`${err.name}\t${err.message}\t${req.url}`, "errorLogs.txt")
    res.status(500).send(err.message)
}

module.exports =  errorHandler;
