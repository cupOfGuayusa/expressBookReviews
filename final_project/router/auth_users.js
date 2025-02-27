const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let validUsers = users.filter((user) => user.username === username);
  return validUsers.length > 0;
};

const authenticatedUser = (username, password) => {
  let authenticateUser = users.filter((user) =>
    users.find(user.username === username && user.password === password)
  );
  return authenticatedUser !== undefined;
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
  const isbn = req.params.isbn;

  let { username, review } = req.body;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  } else if (!username || !review) {
    return res.status(400).json({ message: "Username and review required" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added successfully" });
});

//Delete Book Review

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { username } = req.body;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  } else if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review from this user found" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review Deleted Succesfully",
    book: books[isbn].title,
    review: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
