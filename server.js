const express = require("express");
const app = express();

const path = require("path");
const cors = require("cors")
const cookieParser = require('cookie-parser');

const corsOptions = require("./configurations/cors")
const { expressLogger } = require("./middleware/eventsLogger")
const errorHandler = require("./middleware/errorHandler")
const authJWT = require("./middleware/authJWT")

const PORT = process.env.PORT || 5000;

// handle CORS
app.use(cors(corsOptions));

// custom middleware request logger
app.use(expressLogger);
  
// built-in middleware to handle form data
// ‘content-type: application/x-www-form-urlencoded’
app.use(express.urlencoded({extended: false}));

// built-in middleware for json 
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

//serve static files
app.use("/", express.static(path.join(__dirname, '/public')));

// Router Setup
// Unauthenticated Routes
app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/auth"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));

// Authenticated Routes
app.use(authJWT);
app.use("/user", require("./routes/user"));
app.use("/employee", require("./routes/employee"));

// base route
app.get("/", (req, res) => {
    //  res.sendFile("./views/404.html", {root: __dirname});
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Handle unknown routes with 404
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

// custom middleware error logger
app.use(errorHandler);

app.listen(PORT, () => console.log("server is running on port", PORT));
