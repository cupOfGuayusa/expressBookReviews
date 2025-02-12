const express = require("express");
let books = require("./booksdb.js");
const { authenticated } = require("./auth_users.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username && !password) {
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
    return res.status(200).send("User successfully logged in!");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  res.json(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const matchingBooks = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author.toLowerCase()
  );

  if (matchingBooks.length) {
    return res.json(matchingBooks);
  } else {
    return res.status(404).json({ message: "Author not found." });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const matchingBooks = Object.values(books).filter(
    (book) => book.title.toLowerCase() === title.toLowerCase()
  );

  if (matchingBooks.length) {
    return res.json(matchingBooks);
  } else {
    return res.status(404).json({ message: "Title not found." });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && Object.keys(book.reviews).length > 0) {
    return res.json(book.reviews);
  } else {
    return res.status(404).json({ message: "Review not found." });
  }
});

module.exports.general = public_users;
