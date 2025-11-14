const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Promise-based helper functions
const getBooks = () => {
  return new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (error) {
      reject(error);
    }
  });
};

const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    try {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    try {
      const matchingBooks = [];
      const bookKeys = Object.keys(books);
      
      for (let key of bookKeys) {
        if (books[key].author === author) {
          matchingBooks.push(books[key]);
        }
      }
      
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject(new Error("No books found by this author"));
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    try {
      const matchingBooks = [];
      const bookKeys = Object.keys(books);
      
      for (let key of bookKeys) {
        if (books[key].title === title) {
          matchingBooks.push(books[key]);
        }
      }
      
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject(new Error("No books found with this title"));
      }
    } catch (error) {
      reject(error);
    }
  });
};

public_users.post("/register", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  
  // Check if username already exists
  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  
  // Register the new user
  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  //Write your code here
  try {
    const booksList = await getBooks();
    return res.status(200).type('json').send(JSON.stringify(booksList, null, 2));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  //Write your code here
  try {
    const isbn = req.params.isbn;
    const book = await getBookByISBN(isbn);
    return res.status(200).type('json').send(JSON.stringify(book, null, 2));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  //Write your code here
  try {
    const author = req.params.author;
    const matchingBooks = await getBooksByAuthor(author);
    return res.status(200).type('json').send(JSON.stringify(matchingBooks, null, 2));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  //Write your code here
  try {
    const title = req.params.title;
    const matchingBooks = await getBooksByTitle(title);
    return res.status(200).type('json').send(JSON.stringify(matchingBooks, null, 2));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).type('json').send(JSON.stringify(books[isbn].reviews, null, 2));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
