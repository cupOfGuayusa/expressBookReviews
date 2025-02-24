const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (users) => {
  let validUsers = users.filter((user) => user.username === user);
  if (validUsers) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  if (isValid(username)) {
    let authenticateUser = users.filter(
      (user) => user.username === username && user.password === password
    );
    if (authenticateUser) {
      return true;
    } else {
      return false;
    }
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in." });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User succesfully logged in!");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid log in. Check username and password." });
  }
});

// Add a book review

regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let { username, review } = req.body;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!username || !review) {
    return res.status(400).json({ message: "Username and review required" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
