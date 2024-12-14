const apiURL = "http://localhost:5000/api/books";
const bookList = document.getElementById("book-list");
const form = document.getElementById("add-book-form");
const titleInput = document.getElementById("book-title");
const yearInput = document.getElementById("book-year");
const categoryInput = document.getElementById("book-category");
const ratingInput = document.getElementById("book-rating");
const searchInput = document.getElementById("search-book");
const searchButton = document.getElementById("search-button");
const sortSelect = document.getElementById("sort-books");
const favoritesButton = document.getElementById("show-favorites");

let books = [];
let currentPage = 1;
const booksPerPage = 8;
let isShowingFavorites = false;

// Fetch books
async function fetchBooks() {
  const response = await fetch(apiURL);
  books = await response.json();
  paginateBooks(books);
}

// Display books
function displayBooks(books) {
  bookList.innerHTML = "";
  books.forEach((book) => {
    const bookCard = document.createElement("div");
    bookCard.className = "book-card";
    bookCard.innerHTML = `
      <h2>${book.title}</h2>
      <p>Year: ${book.year}</p>
      <p>Category: ${book.category}</p>
      <p>Rating: ${book.rating} ⭐</p>
      <button onclick="deleteBook('${book._id}')">Delete</button>
      <button onclick="editBook('${book._id}')">Edit</button>
      <button onclick="toggleFavorite('${book._id}')">${book.favorite ? "Unfavorite" : "Favorite"}</button>
    `;
    bookList.appendChild(bookCard);
  });
}

// Pagination
function paginateBooks(books) {
  const startIndex = (currentPage - 1) * booksPerPage;
  const paginatedBooks = books.slice(startIndex, startIndex + booksPerPage);
  displayBooks(paginatedBooks);
  updatePaginationControls();
}

function updatePaginationControls() {
  const totalPages = Math.ceil(books.length / booksPerPage);
  const paginationDiv = document.getElementById("pagination");
  paginationDiv.innerHTML = `
    <button onclick="prevPage()" ${currentPage === 1 ? "disabled" : ""}>Previous</button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button onclick="nextPage()" ${currentPage === totalPages ? "disabled" : ""}>Next</button>
  `;
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    paginateBooks(books);
  }
}

function nextPage() {
  const totalPages = Math.ceil(books.length / booksPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    paginateBooks(books);
  }
}

// Add book
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newBook = {
    title: titleInput.value,
    year: yearInput.value,
    category: categoryInput.value,
    rating: parseInt(ratingInput.value, 10) || 0,
    favorite: false,
  };
  await fetch(apiURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newBook),
  });
  titleInput.value = "";
  yearInput.value = "";
  categoryInput.value = "";
  ratingInput.value = "";
  fetchBooks();
});

// Edit book
async function editBook(id) {
  const book = books.find((b) => b._id === id);
  if (book) {
    titleInput.value = book.title;
    yearInput.value = book.year;
    categoryInput.value = book.category;
    ratingInput.value = book.rating;
    form.onsubmit = async (e) => {
      e.preventDefault();
      const updatedBook = {
        title: titleInput.value,
        year: yearInput.value,
        category: categoryInput.value,
        rating: parseInt(ratingInput.value, 10) || 0,
        favorite: book.favorite,
      };
      await fetch(`${apiURL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBook),
      });
      titleInput.value = "";
      yearInput.value = "";
      categoryInput.value = "";
      ratingInput.value = "";
      form.onsubmit = addBookHandler;
      fetchBooks();
    };
  }
}

// Delete book
async function deleteBook(id) {
  if (confirm("Are you sure you want to delete this book?")) {
    await fetch(`${apiURL}/${id}`, { method: "DELETE" });
    fetchBooks();
  }
}

// Toggle Favorite
async function toggleFavorite(id) {
  const book = books.find((b) => b._id === id);
  if (book) {
    const updatedBook = { ...book, favorite: !book.favorite };
    await fetch(`${apiURL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedBook),
    });
    fetchBooks();
  }
}

// Search books
searchButton.addEventListener("click", () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.category.toLowerCase().includes(searchTerm) ||
      book.year.toString().includes(searchTerm)
  );
  paginateBooks(filteredBooks);
});

// Sort books
sortSelect.addEventListener("change", () => {
  const sortBy = sortSelect.value;
  books.sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "year") return a.year - b.year;
    if (sortBy === "rating") return b.rating - a.rating;
  });
  paginateBooks(books);
});

// Show Favorites
favoritesButton.addEventListener("click", () => {
  isShowingFavorites = !isShowingFavorites;
  favoritesButton.textContent = isShowingFavorites ? "Show All" : "Show Favorites";
  if (isShowingFavorites) {
    const favoriteBooks = books.filter((book) => book.favorite);
    paginateBooks(favoriteBooks);
  } else {
    paginateBooks(books);
  }
});

// Initial load
fetchBooks();
