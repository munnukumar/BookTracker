const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const port = 5000;

const authorData = [];
const bookData = [];

// Middleware to log user request in file
app.use((req, res, next) => {
  const logData = `${new Date().toISOString()} ${req.method} ${req.path} ${JSON.stringify(req.body)}\n`;
  fs.appendFile('requests.log', logData, (err) => {
    if (err) console.error(err);
  });
  next();
});

// create author
app.post('/author', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Author name is required' });
  }
  const insertAuthor = {
    authorId: uuidv4(),
    name,
  };
  const existingAuthor = authorData.find((author) => author.name === name);
  if (existingAuthor) {
    return res.status(400).json({ error: 'Author already exists' });
  }
  authorData.push(insertAuthor);
  return res.status(200).json(insertAuthor);
});

// create books
app.post('/book', (req, res) => {
  const { authorId, bookName, ISBN } = req.body;
  if (!authorId || !bookName || !ISBN) {
    return res.status(400).json({ error: 'Author ID, book name, and ISBN are required' });
  }
  const author = authorData.find((author) => author.authorId === authorId);
  if (!author) {
    return res.status(404).json({ error: 'Author not found' });
  }
  const insertBooks = {
    bookId: uuidv4(),
    authorId,
    bookName,
    ISBN,
  };
  const existingBook = bookData.find((book) => book.ISBN === insertBooks.ISBN);
  if (existingBook) {
    return res.status(409).json({ error: 'Book already exists' });
  }
  bookData.push(insertBooks);
  return res.status(201).json(insertBooks);
});

// get all books
app.get('/author', (req, res) => {
  return res.json(authorData);
});

// get all books
app.get('/book', (req, res) => {
  return res.json(bookData);
});

// get author by id and its books
app.get('/author/:id', (req, res) => {
  const author = authorData.find((author) => author.authorId == req.params.id);
  if (!author) {
    return res.status(404).json({ error: 'Author not found' });
  }
  const books = bookData.filter((book) => book.authorId == req.params.id);

  // author.books = books;
  return res.json({...author, bookData:books});
});

// get book by id and its author
app.get('/book/:id', (req, res) => {
  const booksId = req.params.id;
  const book = bookData.find((book) => book.bookId === booksId);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  
  const author = authorData.find((author) => author.authorId === book.authorId);
  res.status(200).json({ book, author });
});

//update auther by Id
app.patch('/author/:id', (req, res) => {
  const data = req.body
    const author = authorData.find((author) => author.authorId === req.params.id);
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    const books = bookData.filter((item) => item.authorId === author.id);
    author.name = data.name;
    return res.json(author);
})


//update book by Id
app.patch('/book/:id', (req, res) => {
  const data  = req.body;
  const book = bookData.find((book) => book.bookId === req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  book.bookName = data.bookName;
  book.ISBN = data.ISBN;
  return res.json(book);
})

// Delete Auther by id
app.delete('/author/:id', (req, res) => {
  const authorIndex = authorData.findIndex((author) => author.authorId === req.params.id);
  if (authorIndex === -1) {
    return res.status(404).json({ error: 'Author not found' });
  }
  author = authorData[authorIndex]
  authorData.splice(authorIndex, 1)
  return res.send({message:"AUTHOR_DELETED", author});
})



// Delete Book by id
app.delete('/book/:id', (req, res) => {
  const bookIndex = bookData.findIndex((book) => book.bookId === req.params.id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const book = bookData[bookIndex]
  bookData.splice(bookIndex, 1)

  return res.send({message: "BOOK_DELETE", book});
})


//server
app.listen(port, () => {
  console.log(` Server listening on port ${port}`)
})