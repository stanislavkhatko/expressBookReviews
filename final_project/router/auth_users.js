const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  return users.some(user => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  
  // Validate credentials
  if (authenticatedUser(username, password)) {
    // Create JWT token
    let accessToken = jwt.sign(
      {
        data: username
      },
      "access",
      { expiresIn: 60 * 60 } // 1 hour
    );
    
    // Store token in session
    req.session.authorization = {
      accessToken: accessToken
    };
    
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.data; // Get username from JWT token stored in session
  
  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  
  // Check if review is provided
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }
  
  // Initialize reviews object if it doesn't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  
  // Add or modify review for this user
  books[isbn].reviews[username] = review;
  
  return res.status(200).json({ message: `The review for the book with ISBN ${isbn} has been added/updated.` });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.user.data; // Get username from JWT token stored in session
  
  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  
  // Check if reviews exist for this book
  if (!books[isbn].reviews) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
  
  // Check if user has a review for this book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }
  
  // Delete the review for this user only
  delete books[isbn].reviews[username];
  
  return res.status(200).json({ message: `Review for the ISBN ${isbn} posted by the user ${username} deleted.` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
