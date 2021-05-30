var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var watchListRouter = require("./routes/watchlist");

//knex requires
const options = require("./knexfile");
const knex = require("knex")(options);

//swagger requires
const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger.json");

//helmet and cors requires
const helmet = require("helmet");
const cors = require("cors");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
//Adding headers to list of tokens that need processing. DONE BEFORE app.use(logger('dev))
logger.token("req", (req, res) =>
  //JSON.stringify(req.headers)
  console.log(req.headers)
);
logger.token("res", (req, res) => {
  const headers = {};
  res.getHeaderNames().map((h) => (headers[h] = res.getHeader(h)));
  //return JSON.stringify(headers);
  return console.log(headers);
});

//logger use
app.use(logger("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//swagger use
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//helmet use
app.use(helmet());
app.use(cors());

//for knex
app.use((req, res, next) => {
  req.db = knex;
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/watchlist", watchListRouter);

app.get("/knex", function (req, res, next) {
  req.db
    .from("users")
    .select("*")
    .then((user) => {
      if (user.length === 0) {
        console.log("no users");
      }
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
  res.send("Version Logged successfully");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
