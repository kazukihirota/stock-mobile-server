var express = require("express");
var router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get("/", function (req, res, next) {
  res.send("watchlist page");
});

const authorize = (req, res, next) => {
  const authorization = req.headers.authorization;
  const secretKey = "secretKey";
  let token = null;

  //Retrieve token
  if (authorization && authorization.split(" ").length === 2) {
    token = authorization.split(" ")[1];
    jwt.verify(token, secretKey, (err) => {
      if (err) {
        return res.status(400).json({
          error: true,
          message: "Request body imcomplete - userId and symbol needed",
        });
      }

      next();
    });
  } else {
    console.log("unauthrised user");
    return;
  }
};

router.post("/update", authorize, async function (req, res, next) {
  const userId = req.body.userId;
  const symbol = req.body.symbol;
  if (!userId || !symbol) {
    res.status(400).json({
      error: true,
      message: "Request body imcomplete - userId and symbol needed",
    });
    return;
  }

  //does not add to the databse if the data already exists
  const queryWatchlist = req.db
    .from("watchlist")
    .select("*")
    .where("userId", "=", userId);

  const userList = await queryWatchlist.then((list) => {
    if (list.length === 0) return;
    const outputArray = Object.values(JSON.parse(JSON.stringify(list)));
    return outputArray;
  });

  const symbolExist =
    userList !== undefined
      ? userList.filter((obj) => obj.symbol === symbol)
      : [];

  if (symbolExist.length !== 0) {
    console.log("data already exists");
  } else {
    req
      .db("watchlist")
      .insert({ userId: userId, symbol: symbol })
      .then((result) => res.json({ success: true, message: "ok" }));
    console.log("data inserted ");
  }
});

router.post("/delete", authorize, async function (req, res, next) {
  const userId = req.body.userId;
  const symbol = req.body.symbol;
  if (!userId || !symbol) {
    res.status(400).json({
      error: true,
      message: "Request body imcomplete - userId and symbol needed",
    });
    return;
  }

  //does not add to the databse if the data already exists
  const queryWatchlist = req.db
    .from("watchlist")
    .select("*")
    .where("userId", "=", userId);

  const userList = await queryWatchlist.then((list) => {
    if (list.length === 0) return;
    const outputArray = Object.values(JSON.parse(JSON.stringify(list)));
    return outputArray;
  });

  const symbolExist =
    userList !== undefined
      ? userList.filter((obj) => obj.symbol === symbol)
      : [];
  if (symbolExist.length === 0) {
    console.log("No data to delete");
  } else {
    req
      .db("watchlist")
      .where({ userId: userId, symbol: symbol })
      .del()
      .then((result) => res.json({ success: true, message: "ok" }));
    console.log("data deleted ");
  }
});

module.exports = router;
