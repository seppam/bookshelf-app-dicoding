// ============================================================
// Bookshelf App - Complete Implementation
// Mandatory: Add, Move, Delete, LocalStorage persistence
// Optional:  Search by title, Edit book
// Target:    Full marks (5 stars) on Dicoding submission
// ============================================================

const STORAGE_KEY = 'BOOKSHELF_APPS';

// ============================================================
// Data Layer
// ============================================================

function generateId() {
  return +new Date() + Math.random().toString(36).substr(2, 9);
}

function getBooks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveBooks(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

// ============================================================
// Render Layer
// ============================================================

function renderBooks(searchQuery = '') {
  const books = getBooks();
  const query = (searchQuery || '').toLowerCase().trim();

  const incompleteList = document.getElementById('incompleteBookList');
  const completeList = document.getElementById('completeBookList');
  if (!incompleteList || !completeList) return;

  incompleteList.innerHTML = '';
  completeList.innerHTML = '';

  // Empty-state placeholders
  const emptyIncomplete = document.createElement('p');
  emptyIncomplete.classList.add('empty-shelf');
  emptyIncomplete.textContent = 'Tidak ada buku';
  incompleteList.appendChild(emptyIncomplete);

  const emptyComplete = document.createElement('p');
  emptyComplete.classList.add('empty-shelf');
  emptyComplete.textContent = 'Tidak ada buku';
  completeList.appendChild(emptyComplete);

  let hasIncomplete = false;
  let hasComplete = false;

  for (const book of books) {
    const titleMatch = query === '' || book.title.toLowerCase().includes(query);
    if (!titleMatch) continue;

    const bookEl = createBookElement(book);

    if (book.isComplete) {
      if (!hasComplete) {
        const ph = completeList.querySelector('.empty-shelf');
        if (ph) ph.remove();
      }
      completeList.appendChild(bookEl);
      hasComplete = true;
    } else {
      if (!hasIncomplete) {
        const ph = incompleteList.querySelector('.empty-shelf');
        if (ph) ph.remove();
      }
      incompleteList.appendChild(bookEl);
      hasIncomplete = true;
    }
  }
}

function createBookElement(book) {
  const container = document.createElement('div');
  container.classList.add('book-item');
  container.setAttribute('data-bookid', book.id);
  container.setAttribute('data-testid', 'bookItem');

  const title = document.createElement('h3');
  title.setAttribute('data-testid', 'bookItemTitle');
  title.textContent = book.title;
  title.classList.add('book-item__title');

  const author = document.createElement('p');
  author.setAttribute('data-testid', 'bookItemAuthor');
  author.textContent = `Penulis: ${book.author}`;
  author.classList.add('book-item__author');

  const year = document.createElement('p');
  year.setAttribute('data-testid', 'bookItemYear');
  year.textContent = `Tahun: ${book.year}`;
  year.classList.add('book-item__year');

  const btnGroup = document.createElement('div');
  btnGroup.classList.add('book-item__actions');

  // Move / Complete button
  const moveBtn = document.createElement('button');
  moveBtn.setAttribute('data-testid', 'bookItemIsCompleteButton');
  moveBtn.textContent = book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  moveBtn.classList.add('btn', 'btn--move');
  moveBtn.addEventListener('click', () => toggleBookComplete(book.id));

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteBtn.textContent = 'Hapus Buku';
  deleteBtn.classList.add('btn', 'btn--delete');
  deleteBtn.addEventListener('click', () => deleteBook(book.id));

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.setAttribute('data-testid', 'bookItemEditButton');
  editBtn.textContent = 'Edit Buku';
  editBtn.classList.add('btn', 'btn--edit');
  editBtn.addEventListener('click', () => openEditModal(book));

  btnGroup.appendChild(moveBtn);
  btnGroup.appendChild(deleteBtn);
  btnGroup.appendChild(editBtn);

  container.appendChild(title);
  container.appendChild(author);
  container.appendChild(year);
  container.appendChild(btnGroup);

  return container;
}

// ============================================================
// Business Logic
// ============================================================

function addBook(title, author, year, isComplete) {
  const books = getBooks();
  const newBook = {
    id: generateId(),
    title: title.trim(),
    author: author.trim(),
    year: parseInt(year, 10),
    isComplete: Boolean(isComplete),
  };
  books.push(newBook);
  saveBooks(books);
  renderBooks(getCurrentSearchQuery());
}

function toggleBookComplete(bookId) {
  const books = getBooks();
  const idx = books.findIndex((b) => b.id === bookId);
  if (idx === -1) return;
  books[idx].isComplete = !books[idx].isComplete;
  saveBooks(books);
  renderBooks(getCurrentSearchQuery());
}

function deleteBook(bookId) {
  const confirmed = window.confirm(
    'Apakah Anda yakin ingin menghapus buku ini?'
  );
  if (!confirmed) return;
  saveBooks(getBooks().filter((b) => b.id !== bookId));
  renderBooks(getCurrentSearchQuery());
}

function updateBook(bookId, title, author, year, isComplete) {
  const books = getBooks();
  const idx = books.findIndex((b) => b.id === bookId);
  if (idx === -1) return;
  books[idx].title = title.trim();
  books[idx].author = author.trim();
  books[idx].year = parseInt(year, 10);
  books[idx].isComplete = Boolean(isComplete);
  saveBooks(books);
  renderBooks(getCurrentSearchQuery());
}

function getCurrentSearchQuery() {
  const input = document.getElementById('searchBookTitle');
  return input ? input.value : '';
}

// ============================================================
// Edit Modal
// ============================================================

function openEditModal(book) {
  closeEditModal();

  const overlay = document.createElement('div');
  overlay.id = 'editModalOverlay';

  const modal = document.createElement('div');

  const heading = document.createElement('h2');
  heading.textContent = 'Edit Buku';

  const form = document.createElement('form');
  form.id = 'editBookForm';

  function makeField(id, labelText, type, value, required) {
    const row = document.createElement('div');
    row.classList.add('form-row');

    const lbl = document.createElement('label');
    lbl.setAttribute('for', id);
    lbl.textContent = labelText;

    const inp = document.createElement('input');
    inp.id = id;
    inp.type = type;
    inp.value = value;
    inp.required = required;
    inp.setAttribute('data-testid', `editBook${labelText.replace(' ', '')}Input`);

    if (type === 'checkbox') {
      row.classList.add('form-row--checkbox');
      row.appendChild(inp);
      row.appendChild(lbl);
    } else {
      row.appendChild(lbl);
      row.appendChild(inp);
    }

    return { row, inp };
  }

  const titleRow = makeField('editTitle', 'Judul', 'text', book.title, true);
  const authorRow = makeField('editAuthor', 'Penulis', 'text', book.author, true);
  const yearRow = makeField('editYear', 'Tahun', 'number', book.year, true);
  const isCompleteRow = makeField('editIsComplete', 'Selesai dibaca', 'checkbox', '', false);
  isCompleteRow.inp.checked = book.isComplete;

  const btnRow = document.createElement('div');
  btnRow.classList.add('btn-row');

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.textContent = 'Simpan';
  saveBtn.id = 'editBookSubmitButton';
  saveBtn.setAttribute('data-testid', 'editBookSubmitButton');

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.id = 'cancelEditButton';
  cancelBtn.textContent = 'Batal';
  cancelBtn.addEventListener('click', closeEditModal);

  btnRow.appendChild(saveBtn);
  btnRow.appendChild(cancelBtn);

  form.appendChild(titleRow.row);
  form.appendChild(authorRow.row);
  form.appendChild(yearRow.row);
  form.appendChild(isCompleteRow.row);
  form.appendChild(btnRow);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    updateBook(
      book.id,
      titleRow.inp.value,
      authorRow.inp.value,
      yearRow.inp.value,
      isCompleteRow.inp.checked
    );
    closeEditModal();
  });

  modal.appendChild(heading);
  modal.appendChild(form);
  overlay.appendChild(modal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeEditModal();
  });

  document.body.appendChild(overlay);
  titleRow.inp.focus();
  document.addEventListener('keydown', handleEscape);
}

function closeEditModal() {
  const overlay = document.getElementById('editModalOverlay');
  if (overlay) {
    overlay.remove();
    document.removeEventListener('keydown', handleEscape);
  }
}

function handleEscape(e) {
  if (e.key === 'Escape') closeEditModal();
}

// ============================================================
// Form Handlers
// ============================================================

function initForms() {
  const bookForm = document.getElementById('bookForm');
  if (bookForm) {
    bookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('bookFormTitle')?.value || '';
      const author = document.getElementById('bookFormAuthor')?.value || '';
      const year = document.getElementById('bookFormYear')?.value || '';
      const isComplete = document.getElementById('bookFormIsComplete')?.checked || false;
      addBook(title, author, year, isComplete);
      bookForm.reset();
    });
  }

  // Update submit button text when checkbox changes
  const checkbox = document.getElementById('bookFormIsComplete');
  const submitBtn = document.getElementById('bookFormSubmit');
  const spanEl = submitBtn?.querySelector('span');
  if (checkbox && submitBtn) {
    checkbox.addEventListener('change', () => {
      if (spanEl) {
        spanEl.textContent = checkbox.checked
          ? 'Selesai dibaca'
          : 'Belum selesai dibaca';
      }
    });
  }

  // Search form
  const searchForm = document.getElementById('searchBook');
  const searchInput = document.getElementById('searchBookTitle');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      renderBooks(searchInput?.value || '');
    });
  }
  // Live search as user types
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderBooks(searchInput.value);
    });
  }
}

// ============================================================
// Init
// ============================================================

function init() {
  renderBooks();
  initForms();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
