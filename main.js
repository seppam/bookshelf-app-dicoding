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

  // Show "empty" placeholder when no books
  const emptyIncomplete = document.createElement('div');
  emptyIncomplete.style.cssText =
    'text-align:center; color:#888; padding:20px; font-style:italic;';
  emptyIncomplete.textContent = 'Tidak ada buku';
  incompleteList.appendChild(emptyIncomplete);

  const emptyComplete = document.createElement('div');
  emptyComplete.style.cssText =
    'text-align:center; color:#888; padding:20px; font-style:italic;';
  emptyComplete.textContent = 'Tidak ada buku';
  completeList.appendChild(emptyComplete);

  let hasIncomplete = false;
  let hasComplete = false;

  for (const book of books) {
    const titleMatch =
      query === '' || book.title.toLowerCase().includes(query);

    if (!titleMatch) continue;

    const bookEl = createBookElement(book);

    if (book.isComplete) {
      if (hasComplete) {
        // Remove empty placeholder
        completeList.innerHTML = '';
      }
      completeList.appendChild(bookEl);
      hasComplete = true;
    } else {
      if (hasIncomplete) {
        // Remove empty placeholder
        incompleteList.innerHTML = '';
      }
      incompleteList.appendChild(bookEl);
      hasIncomplete = true;
    }
  }

  // Clean up empty placeholders
  if (hasIncomplete) {
    const placeholder = incompleteList.querySelector('div[style]');
    if (placeholder) placeholder.remove();
  }
  if (hasComplete) {
    const placeholder = completeList.querySelector('div[style]');
    if (placeholder) placeholder.remove();
  }
}

function createBookElement(book) {
  const container = document.createElement('div');
  container.setAttribute('data-bookid', book.id);
  container.setAttribute('data-testid', 'bookItem');
  container.style.cssText =
    'border:1px solid #ddd; border-radius:8px; padding:16px; margin-bottom:12px; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.05);';

  const title = document.createElement('h3');
  title.setAttribute('data-testid', 'bookItemTitle');
  title.textContent = book.title;
  title.style.cssText =
    'margin:0 0 8px 0; font-size:1.1rem; color:#333;';

  const author = document.createElement('p');
  author.setAttribute('data-testid', 'bookItemAuthor');
  author.textContent = `Penulis: ${book.author}`;
  author.style.cssText = 'margin:0 0 4px 0; font-size:0.9rem; color:#666;';

  const year = document.createElement('p');
  year.setAttribute('data-testid', 'bookItemYear');
  year.textContent = `Tahun: ${book.year}`;
  year.style.cssText = 'margin:0 0 12px 0; font-size:0.9rem; color:#666;';

  const btnGroup = document.createElement('div');
  btnGroup.style.cssText = 'display:flex; gap:8px; flex-wrap:wrap;';

  // Move / Complete button
  const moveBtn = document.createElement('button');
  moveBtn.setAttribute('data-testid', 'bookItemIsCompleteButton');
  moveBtn.textContent = book.isComplete
    ? 'Belum selesai dibaca'
    : 'Selesai dibaca';
  moveBtn.style.cssText =
    'padding:6px 14px; border:1px solid #0d47a1; background:#fff; color:#0d47a1; border-radius:4px; cursor:pointer; font-size:0.85rem; border-radius:20px; transition:all 0.2s;';
  moveBtn.addEventListener('mouseenter', () => {
    moveBtn.style.background = '#0d47a1';
    moveBtn.style.color = '#fff';
  });
  moveBtn.addEventListener('mouseleave', () => {
    moveBtn.style.background = '#fff';
    moveBtn.style.color = '#0d47a1';
  });
  moveBtn.addEventListener('click', () => toggleBookComplete(book.id));

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteBtn.textContent = 'Hapus Buku';
  deleteBtn.style.cssText =
    'padding:6px 14px; border:1px solid #c62828; background:#fff; color:#c62828; border-radius:4px; cursor:pointer; font-size:0.85rem; border-radius:20px; transition:all 0.2s;';
  deleteBtn.addEventListener('mouseenter', () => {
    deleteBtn.style.background = '#c62828';
    deleteBtn.style.color = '#fff';
  });
  deleteBtn.addEventListener('mouseleave', () => {
    deleteBtn.style.background = '#fff';
    deleteBtn.style.color = '#c62828';
  });
  deleteBtn.addEventListener('click', () => deleteBook(book.id));

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.setAttribute('data-testid', 'bookItemEditButton');
  editBtn.textContent = 'Edit Buku';
  editBtn.style.cssText =
    'padding:6px 14px; border:1px solid #f57f17; background:#fff; color:#f57f17; border-radius:4px; cursor:pointer; font-size:0.85rem; border-radius:20px; transition:all 0.2s;';
  editBtn.addEventListener('mouseenter', () => {
    editBtn.style.background = '#f57f17';
    editBtn.style.color = '#fff';
  });
  editBtn.addEventListener('mouseleave', () => {
    editBtn.style.background = '#fff';
    editBtn.style.color = '#f57f17';
  });
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
  const books = getBooks().filter((b) => b.id !== bookId);
  saveBooks(books);
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
// Modal (Edit Book)
// ============================================================

function openEditModal(book) {
  // Remove existing modal if any
  closeEditModal();

  const overlay = document.createElement('div');
  overlay.id = 'editModalOverlay';
  overlay.style.cssText =
    'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;';

  const modal = document.createElement('div');
  modal.style.cssText =
    'background:#fff; border-radius:12px; padding:28px; width:90%; max-width:420px; box-shadow:0 8px 32px rgba(0,0,0,0.2);';

  const title = document.createElement('h2');
  title.textContent = 'Edit Buku';
  title.style.cssText =
    'margin:0 0 20px 0; font-size:1.3rem; color:#333;';

  const form = document.createElement('form');
  form.id = 'editBookForm';

  function inputField(id, label, type, value, required) {
    const row = document.createElement('div');
    row.style.cssText = 'margin-bottom:14px;';

    const lbl = document.createElement('label');
    lbl.setAttribute('for', id);
    lbl.textContent = label;
    lbl.style.cssText = 'display:block; margin-bottom:4px; font-weight:600; font-size:0.9rem; color:#444;';

    const inp = document.createElement('input');
    inp.id = id;
    inp.type = type;
    inp.value = value;
    inp.required = required;
    inp.setAttribute('data-testid', `editBook${label.replace(' ', '')}Input`);
    inp.style.cssText =
      'width:100%; padding:8px 12px; border:1px solid #ddd; border-radius:6px; font-size:0.95rem; box-sizing:border-box;';
    if (type === 'checkbox') {
      inp.style.cssText =
        'width:auto; margin-right:8px; display:inline-block; vertical-align:middle;';
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex; align-items:center;';
      wrapper.appendChild(inp);
      wrapper.appendChild(lbl);
      row.appendChild(wrapper);
    } else {
      row.appendChild(lbl);
      row.appendChild(inp);
    }

    return { row, inp };
  }

  const titleRow = inputField('editTitle', 'Judul', 'text', book.title, true);
  const authorRow = inputField('editAuthor', 'Penulis', 'text', book.author, true);
  const yearRow = inputField('editYear', 'Tahun', 'number', book.year, true);
  const isCompleteRow = inputField('editIsComplete', 'Selesai dibaca', 'checkbox', '', false);

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex; gap:10px; margin-top:20px;';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.textContent = 'Simpan';
  saveBtn.setAttribute('data-testid', 'editBookSubmitButton');
  saveBtn.style.cssText =
    'flex:1; padding:10px; background:#0d47a1; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:1rem; font-weight:600;';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Batal';
  cancelBtn.style.cssText =
    'flex:1; padding:10px; background:#fff; color:#666; border:1px solid #ddd; border-radius:6px; cursor:pointer; font-size:1rem;';

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

  modal.appendChild(title);
  modal.appendChild(form);
  overlay.appendChild(modal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeEditModal();
  });

  document.body.appendChild(overlay);
  titleRow.inp.focus();

  // ESC key to close
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
  // Add book form
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

  // Update submit button text based on checkbox
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
      const query = searchInput?.value || '';
      renderBooks(query);
    });
  }

  // Live search (optional — updates as user types)
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

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
