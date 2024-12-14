const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/bookexplorer';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Mongoose schema and model
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  category: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  favorite: { type: Boolean, default: false },
});

const Book = mongoose.model('Book', bookSchema);

// Routes
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

app.post('/api/books', async (req, res) => {
  const { title, year, category, rating } = req.body;
  try {
    const newBook = new Book({ title, year, category, rating });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add book' });
  }
});

app.put('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const { title, year, category, rating, favorite } = req.body;
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { title, year, category, rating, favorite },
      { new: true, runValidators: true }
    );
    if (updatedBook) {
      res.json(updatedBook);
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to update book' });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedBook = await Book.findByIdAndDelete(id);
    if (deletedBook) {
      res.json({ message: 'Book deleted successfully' });
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
