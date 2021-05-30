var express = require("express");
var router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("Users page");
});
router.post("/register", function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body imcomplete - email and password needed",
    });
    return;
  }

  const queryUsers = req.db
    .from("users")
    .select("*")
    .where("email", "=", email);

  console.log(queryUsers);

  queryUsers
    .then((users) => {
      if (users.length > 0) {
        console.log("User already exists");
        return;
      }

      const saltRounds = 10;
      const hash = bcrypt.hashSync(password, saltRounds);
      return req.db.from("users").insert({ email, hash });
    })
    .then(() => {
      res.status(201).json({ success: true, message: "User created" });
    });
});

router.post("/login", async function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body imcomplete - email and password needed",
    });
    return;
  }
  const queryUsers = req.db
    .from("users")
    .select("*")
    .where("email", "=", email);

  //returning a user id from the promise
  const userId = await queryUsers.then((users) => {
    if (users.length === 0) {
      return;
    }
    return users[0].id;
  });

  queryUsers
    .then((users) => {
      if (users.length === 0) {
        // res.status(400).json({
        //   error: true,
        //   message: "User not found",
        // });
        console.log("User not found");
        return;
      }
      const user = users[0];
      return bcrypt.compare(password, user.hash);
    })
    .then((result) => {
      if (!result) {
        console.log("password incorrect");
        return;
      }
      //create and return JWT token
      const secretKey = "secretKey";
      const expires_in = 60 * 60 * 24 * 7; //7 days
      const exp = Date.now() + expires_in * 1000;
      const token = jwt.sign({ email, exp }, secretKey);
      res.json({ token_type: "Bearer", token, expires_in, userId });
    });
});
module.exports = router;
