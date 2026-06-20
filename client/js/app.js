/**
 * app.js - Main Client Logic
 */

import {
  graphqlRequest,
  GET_DASHBOARD_DATA,
  GET_BOOKS,
  GET_MEMBERS,
  GET_BORROWINGS,
  GET_FINES,
  GET_CATEGORIES,
  ADD_BOOK_MANUAL,
  ADD_BOOK_BY_ISBN,
  UPDATE_BOOK_STOCK,
  DELETE_BOOK,
  ADD_CATEGORY,
  DELETE_CATEGORY,
  ADD_MEMBER,
  DELETE_MEMBER,
  BORROW_BOOK,
  RETURN_BOOK,
  PAY_FINE
} from './api.js';

// ==========================================
// Application State & Constants
// ==========================================
let currentTab = 'dashboard';
let categoriesList = []; // Cached categories
let membersList = []; // Cached members
let booksList = []; // Cached books (with stock > 0)

// ==========================================
// UI Helpers & Utilities
// ==========================================

// Date Formatter (Indonesian Format)
function formatDate(dateValue) {
  if (!dateValue) return '-';
  try {
    let date;
    if (!isNaN(dateValue) && !isNaN(parseFloat(dateValue))) {
      date = new Date(parseInt(dateValue, 10));
    } else {
      date = new Date(dateValue);
    }
    if (isNaN(date.getTime())) return dateValue;
    
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\./g, ':');
  } catch (e) {
    return dateValue;
  }
}

// Currency Formatter
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-triangle';
  else if (type === 'info') iconName = 'info';

  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  // Trigger slide-in
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto remove after 4 seconds
  const autoRemove = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);

  // Close button click
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(autoRemove);
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });
}

// Global Loader toggle
function setGlobalLoading(state) {
  const indicators = document.querySelectorAll('.status-indicator');
  indicators.forEach(ind => {
    const dot = ind.querySelector('.status-dot');
    const msg = ind.querySelector('.status-mesg');
    if (state === true || state === 'loading') {
      ind.classList.add('loading');
      dot.style.background = 'var(--warning-color)';
      msg.textContent = "Connecting to GraphQL";
    } 
    else if (state === 'error') {
      ind.classList.remove('loading');
      dot.style.background = 'var(--danger-color)';
      msg.textContent = "Failed to connect to GraphQL";
    } 
    else {
      ind.classList.remove('loading');
      dot.style.background = 'var(--success-color)';
      msg.textContent = "GraphQL Connected";
    }
  });
}

// ==========================================
// Tab Router / Navigation
// ==========================================
function switchTab(tabId) {
  // Update state
  currentTab = tabId;
  
  // Update Navigation menu active class
  document.querySelectorAll('.menu-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update views visibility
  document.querySelectorAll('.content-view').forEach(view => {
    if (view.id === `view-${tabId}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  // Update Header Title & Subtitle
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');

  switch (tabId) {
    case 'dashboard':
      pageTitle.textContent = 'Dashboard';
      pageSubtitle.textContent = 'Statistik perpustakaan dan ringkasan aktivitas.';
      renderDashboard();
      break;
    case 'books':
      pageTitle.textContent = 'Koleksi Buku';
      pageSubtitle.textContent = 'Manajemen inventaris buku perpustakaan.';
      renderBooks();
      break;
    case 'members':
      pageTitle.textContent = 'Anggota';
      pageSubtitle.textContent = 'Daftar anggota aktif perpustakaan.';
      renderMembers();
      break;
    case 'categories':
      pageTitle.textContent = 'Kategori Buku';
      pageSubtitle.textContent = 'Klasifikasi kategori buku untuk kemudahan pengelompokan.';
      renderCategories();
      break;
    case 'borrowings':
      pageTitle.textContent = 'Transaksi Peminjaman';
      pageSubtitle.textContent = 'Log peminjaman dan pengembalian buku.';
      renderBorrowings();
      break;
    case 'fines':
      pageTitle.textContent = 'Denda & Pembayaran';
      pageSubtitle.textContent = 'Daftar denda keterlambatan pengembalian buku.';
      renderFines();
      break;
  }
}

// ==========================================
// View Renderers
// ==========================================

// --- DASHBOARD RENDERER ---
async function renderDashboard() {
  setGlobalLoading(true);
  try {
    const data = await graphqlRequest(GET_DASHBOARD_DATA);
    
    // Calculate dashboard statistics
    const totalBooksCount = data.books.reduce((acc, book) => acc + book.stock, 0);
    const availableBooksCount = data.books.reduce((acc, book) => acc + book.availableStock, 0);
    const totalMembersCount = data.members.length;
    const activeLoansCount = data.borrowings.filter(b => b.status === 'BORROWED').length;
    
    const unpaidFinesList = data.fines.filter(f => f.status === 'UNPAID');
    const totalUnpaidFinesAmount = unpaidFinesList.reduce((acc, fine) => acc + fine.amount, 0);

    // Update statistics DOM
    document.getElementById('stat-total-books').textContent = totalBooksCount;
    document.getElementById('stat-avail-books').textContent = `${availableBooksCount} tersedia`;
    document.getElementById('stat-total-members').textContent = totalMembersCount;
    document.getElementById('stat-active-loans').textContent = activeLoansCount;
    document.getElementById('stat-unpaid-fines').textContent = formatCurrency(totalUnpaidFinesAmount);
    document.getElementById('stat-fines-count').textContent = `${unpaidFinesList.length} transaksi denda`;

    // Render Recent Activity Table
    const recentTableBody = document.querySelector('#recent-borrowings-table tbody');
    recentTableBody.innerHTML = '';

    // Take top 5 recent borrowings
    const recentBorrowings = data.borrowings.slice(0, 5);
    
    if (recentBorrowings.length === 0) {
      recentTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">Belum ada transaksi peminjaman.</td>
        </tr>
      `;
    } else {
      const today = new Date();
      recentBorrowings.forEach(item => {
        const dueDate = new Date(parseInt(item.dueDate));
        const isReturned = item.status === 'RETURNED';
        let statusClass = 'badge-warning';
        let statusLabel = 'Dipinjam';

        if (isReturned) {
          statusClass = 'badge-success';
          statusLabel = 'Dikembalikan';
        } else if (today > dueDate) {
          statusClass = 'badge-danger';
          statusLabel = 'Terlambat';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${item.member ? item.member.name : 'Unknown Member'}</strong></td>
          <td>${item.book ? item.book.title : 'Unknown Book'}</td>
          <td>${formatDate(item.borrowDate)}</td>
          <td>${formatDate(item.returnDate || item.dueDate)}</td>
          <td><span class="badge ${statusClass}">${statusLabel}</span></td>
        `;
        recentTableBody.appendChild(row);
      });
    }
    setGlobalLoading(false);
  } catch (error) {
    showToast(`Gagal memuat dashboard: ${error.message}`, 'error');
    setGlobalLoading('error');
  }
}

// --- BOOKS RENDERER ---
async function renderBooks() {
  setGlobalLoading(true);
  const container = document.getElementById('books-grid-container');
  container.innerHTML = `
    <div class="loading-state">
      <span class="spinner"></span>
      <p>Memuat daftar buku...</p>
    </div>
  `;

  try {
    const categoryId = document.getElementById('filter-book-category').value || null;
    const title = document.getElementById('search-book-title').value.trim() || null;

    const data = await graphqlRequest(GET_BOOKS, { categoryId, title });
    
    // Update category filter list
    const filterSelect = document.getElementById('filter-book-category');
    const bookCategorySelect = document.getElementById('book-category-select');
    
    const currentFilterValue = filterSelect.value;
    
    // Keep the "Semua Kategori" option
    filterSelect.innerHTML = '<option value="">Semua Kategori</option>';
    bookCategorySelect.innerHTML = '<option value="">Pilih Kategori</option>';
    
    categoriesList = data.categories;
    
    categoriesList.forEach(cat => {
      filterSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
      bookCategorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });
    
    // Restore selected value if still exists
    filterSelect.value = currentFilterValue;

    container.innerHTML = '';
    
    if (data.books.length === 0) {
      container.innerHTML = `
        <div class="empty-state text-center py-5">
          <i data-lucide="book-x" style="width:48px; height:48px; color:var(--text-secondary); margin-bottom:12px;"></i>
          <p class="text-secondary">Tidak ada buku yang ditemukan.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    data.books.forEach(book => {
      const card = document.createElement('div');
      card.className = 'book-card';
      
      const availablePct = (book.availableStock / book.stock) * 100;
      let stockColor = 'var(--success-color)';
      if (book.availableStock === 0) stockColor = 'var(--danger-color)';
      else if (book.availableStock <= 2) stockColor = 'var(--warning-color)';

      // Unique CSS gradient based on title characters for premium aesthetics
      let charSum = 0;
      for (let i = 0; i < book.title.length; i++) charSum += book.title.charCodeAt(i);
      const hue1 = charSum % 360;
      const hue2 = (charSum + 60) % 360;
      const gradientStyle = `background: linear-gradient(135deg, hsl(${hue1}, 70%, 45%), hsl(${hue2}, 75%, 25%))`;

      const authorsStr = book.authors.join(', ') || 'Penulis Tidak Diketahui';

      let coverContent = '';
      if (book.coverImage && book.coverImage.trim() !== '') {
        coverContent = `<img src="${book.coverImage}" alt="${book.title}" class="cover-img" />`;
      } else {
        coverContent = `
          <div class="cover-fallback">
            <i data-lucide="book" class="cover-icon"></i>
            <span class="cover-title">${book.title}</span>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="book-cover" style="${gradientStyle}">
          ${coverContent}
        </div>
        <div class="book-info">
          <span class="book-card-category">${book.category ? book.category.name : 'Umum'}</span>
          <h4 class="book-card-title" title="${book.title}">${book.title}</h4>
          <p class="book-card-authors">${authorsStr}</p>
          <p class="book-card-isbn"><i data-lucide="barcode" style="width:12px; height:12px; display:inline; margin-right:4px;"></i>${book.isbn || 'Tanpa ISBN'}</p>
          
          <div class="book-stock-container">
            <div class="stock-labels">
              <span>Stok: <strong>${book.availableStock}/${book.stock}</strong></span>
              <span style="color: ${stockColor}; font-weight:500;">
                ${book.availableStock === 0 ? 'Habis' : 'Tersedia'}
              </span>
            </div>
            <div class="stock-progress-bar">
              <div class="stock-progress" style="width: ${availablePct}%; background-color: ${stockColor};"></div>
            </div>
          </div>
          
          <div class="book-card-actions">
            <button class="btn btn-secondary btn-sm btn-edit-stock" data-id="${book.id}" data-title="${book.title}" data-stock="${book.stock}" data-avail="${book.availableStock}">
              <i data-lucide="edit-3"></i>
              <span>Stok</span>
            </button>
            <button class="btn btn-danger-soft btn-sm btn-delete-book" data-id="${book.id}" data-title="${book.title}">
              <i data-lucide="trash-2"></i>
              <span>Hapus</span>
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    lucide.createIcons();

    // Hook up buttons
    document.querySelectorAll('.btn-edit-stock').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const btnElem = e.currentTarget;
        document.getElementById('edit-stock-book-id').value = btnElem.getAttribute('data-id');
        document.getElementById('edit-stock-title').textContent = btnElem.getAttribute('data-title');
        document.getElementById('edit-stock-value').value = btnElem.getAttribute('data-stock');
        
        const avail = parseInt(btnElem.getAttribute('data-avail'));
        const total = parseInt(btnElem.getAttribute('data-stock'));
        const borrowed = total - avail;
        
        document.getElementById('edit-stock-info').textContent = 
          borrowed > 0 ? `Buku sedang dipinjam: ${borrowed} pcs. Minimal stok adalah ${borrowed}.` : 'Tidak ada buku yang sedang dipinjam.';
        
        document.getElementById('edit-stock-value').min = borrowed;
        
        openModal('modal-edit-stock');
      });
    });

    document.querySelectorAll('.btn-delete-book').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const title = e.currentTarget.getAttribute('data-title');
        if (confirm(`Apakah Anda yakin ingin menghapus buku "${title}"?`)) {
          setGlobalLoading(true);
          try {
            await graphqlRequest(DELETE_BOOK, { id });
            showToast('Buku berhasil dihapus', 'success');
            renderBooks();
          } catch (err) {
            showToast(`Gagal menghapus: ${err.message}`, 'error');
          } finally {
            setGlobalLoading(false);
          }
        }
      });
    });
    setGlobalLoading(false);
    
  } catch (error) {
    showToast(`Gagal memuat buku: ${error.message}`, 'error');
    setGlobalLoading('error');
  }
}

// --- MEMBERS RENDERER ---
async function renderMembers() {
  setGlobalLoading(true);
  const tbody = document.querySelector('#members-table tbody');
  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center text-muted py-4">Memuat data anggota...</td>
    </tr>
  `;

  try {
    const data = await graphqlRequest(GET_MEMBERS);
    tbody.innerHTML = '';
    membersList = data.members;

    if (data.members.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">Belum ada anggota terdaftar.</td>
        </tr>
      `;
      return;
    }

    data.members.forEach(member => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>#${member.id}</strong></td>
        <td>${member.name}</td>
        <td>${member.phoneNumber}</td>
        <td><span class="badge ${member.activeBorrowings > 0 ? 'badge-warning' : 'badge-neutral'}">${member.activeBorrowings} Dipinjam</span></td>
        <td class="text-right">
          <button class="btn btn-icon btn-danger-soft btn-delete-member" data-id="${member.id}" data-name="${member.name}">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    lucide.createIcons();

    // Hook delete buttons
    document.querySelectorAll('.btn-delete-member').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const name = e.currentTarget.getAttribute('data-name');
        if (confirm(`Hapus anggota "${name}"?`)) {
          setGlobalLoading(true);
          try {
            await graphqlRequest(DELETE_MEMBER, { id });
            showToast('Anggota berhasil dihapus', 'success');
            renderMembers();
          } catch (err) {
            showToast(`Gagal menghapus: ${err.message}`, 'error');
          } finally {
            setGlobalLoading(false);
          }
        }
      });
    });
    setGlobalLoading(false);

  } catch (error) {
    showToast(`Gagal memuat anggota: ${error.message}`, 'error');
    setGlobalLoading('error');
  }
}

// --- CATEGORIES RENDERER ---
async function renderCategories() {
  setGlobalLoading(true);
  const tbody = document.querySelector('#categories-table tbody');
  tbody.innerHTML = `
    <tr>
      <td colspan="4" class="text-center text-muted py-4">Memuat data kategori...</td>
    </tr>
  `;

  try {
    const data = await graphqlRequest(GET_CATEGORIES);
    tbody.innerHTML = '';
    categoriesList = data.categories;

    if (data.categories.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-muted py-4">Belum ada kategori buku.</td>
        </tr>
      `;
      return;
    }

    data.categories.forEach(cat => {
      const count = cat.books ? cat.books.length : 0;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>#${cat.id}</strong></td>
        <td>${cat.name}</td>
        <td>${count} Buku</td>
        <td class="text-right">
          <button class="btn btn-icon btn-danger-soft btn-delete-category" data-id="${cat.id}" data-name="${cat.name}">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    lucide.createIcons();

    document.querySelectorAll('.btn-delete-category').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const name = e.currentTarget.getAttribute('data-name');
        if (confirm(`Hapus kategori "${name}"? Semua buku terkait kategori ini tidak dapat dipindahkan otomatis.`)) {
          setGlobalLoading(true);
          try {
            await graphqlRequest(DELETE_CATEGORY, { id });
            showToast('Kategori berhasil dihapus', 'success');
            renderCategories();
          } catch (err) {
            showToast(`Gagal menghapus: ${err.message}`, 'error');
          } finally {
            setGlobalLoading(false);
          }
        }
      });
    });
    setGlobalLoading(false);

  } catch (error) {
    showToast(`Gagal memuat kategori: ${error.message}`, 'error');
    setGlobalLoading('error');
  }
}

// --- BORROWINGS RENDERER ---
async function renderBorrowings() {
  setGlobalLoading(true);
  const tbody = document.querySelector('#borrowings-table tbody');
  tbody.innerHTML = `
    <tr>
      <td colspan="8" class="text-center text-muted py-4">Memuat data peminjaman...</td>
    </tr>
  `;

  try {
    const data = await graphqlRequest(GET_BORROWINGS);
    tbody.innerHTML = '';

    // Cache list for borrowing form
    membersList = data.members;
    // Only allow books with stock > 0 for new borrowings
    booksList = data.books.filter(b => b.availableStock > 0);

    // Populate borrow book modal select elements
    const memberSelect = document.getElementById('borrow-member-select');
    const bookSelect = document.getElementById('borrow-book-select');

    memberSelect.innerHTML = '<option value="">Pilih Anggota</option>';
    data.members.forEach(m => {
      memberSelect.innerHTML += `<option value="${m.id}">${m.name}</option>`;
    });

    bookSelect.innerHTML = '<option value="">Pilih Buku</option>';
    booksList.forEach(b => {
      bookSelect.innerHTML += `<option value="${b.id}">${b.title} (Sedia: ${b.availableStock})</option>`;
    });

    if (data.borrowings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted py-4">Belum ada catatan peminjaman.</td>
        </tr>
      `;
      return;
    }

    const today = new Date();

    data.borrowings.forEach(item => {
      const dueDate = new Date(parseInt(item.dueDate));
      const isReturned = item.status === 'RETURNED';
      let statusClass = 'badge-warning';
      let statusLabel = 'Dipinjam';

      if (isReturned) {
        statusClass = 'badge-success';
        statusLabel = 'Kembali';
      } else if (today > dueDate) {
        statusClass = 'badge-danger';
        statusLabel = 'Terlambat';
      }

      let actionHtml = '';
      if (!isReturned) {
        actionHtml = `
          <button class="btn btn-success-soft btn-sm btn-return-book" data-id="${item.id}" data-book="${item.book ? item.book.title : ''}">
            <i data-lucide="arrow-down-left"></i>
            <span>Kembalikan</span>
          </button>
        `;
      } else {
        actionHtml = '<span class="text-muted text-sm">Selesai</span>';
      }

      let fineText = '-';
      if (item.fine) {
        const fineStatus = item.fine.status === 'PAID' ? 'Lunas' : 'Belum Lunas';
        const fineColor = item.fine.status === 'PAID' ? 'var(--success-color)' : 'var(--danger-color)';
        fineText = `<span style="color: ${fineColor}; font-weight: 600;">${formatCurrency(item.fine.amount)}</span> <span class="text-xs text-secondary">(${fineStatus})</span>`;
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${item.member ? item.member.name : 'Unknown'}</strong></td>
        <td>${item.book ? item.book.title : 'Unknown'}</td>
        <td>${formatDate(item.borrowDate)}</td>
        <td>${formatDate(item.dueDate)}</td>
        <td>${formatDate(item.returnDate)}</td>
        <td>${fineText}</td>
        <td><span class="badge ${statusClass}">${statusLabel}</span></td>
        <td class="text-right">${actionHtml}</td>
      `;
      tbody.appendChild(row);
    });

    lucide.createIcons();

    // Hook return actions
    document.querySelectorAll('.btn-return-book').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const book = e.currentTarget.getAttribute('data-book');
        if (confirm(`Konfirmasi pengembalian buku "${book}"?`)) {
          setGlobalLoading(true);
          try {
            const res = await graphqlRequest(RETURN_BOOK, { borrowingId: id });
            const returned = res.returnBook;
            
            if (returned.fine) {
              showToast(`Buku dikembalikan. Terlambat! Denda: ${formatCurrency(returned.fine.amount)}`, 'info');
            } else {
              showToast('Buku berhasil dikembalikan tepat waktu!', 'success');
            }
            renderBorrowings();
          } catch (err) {
            showToast(`Gagal mengembalikan buku: ${err.message}`, 'error');
          } finally {
            setGlobalLoading(false);
          }
        }
      });
    });
    setGlobalLoading(false);

  } catch (error) {
    showToast(`Gagal memuat transaksi peminjaman: ${error.message}`, 'error');
    setGlobalLoading('error');
  }
}

// --- FINES RENDERER ---
async function renderFines() {
  setGlobalLoading(true);
  const tbody = document.querySelector('#fines-table tbody');
  tbody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center text-muted py-4">Memuat data denda...</td>
    </tr>
  `;

  try {
    const data = await graphqlRequest(GET_FINES);
    tbody.innerHTML = '';

    if (data.fines.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted py-4">Tidak ada catatan denda.</td>
        </tr>
      `;
      return;
    }

    data.fines.forEach(fine => {
      const isPaid = fine.status === 'PAID';
      const statusClass = isPaid ? 'badge-success' : 'badge-danger';
      const statusLabel = isPaid ? 'Lunas' : 'Belum Lunas';
      
      let actionHtml = '';
      if (!isPaid) {
        actionHtml = `
          <button class="btn btn-primary btn-sm btn-pay-fine" data-id="${fine.id}" data-amount="${fine.amount}">
            <i data-lucide="credit-card"></i>
            <span>Bayar</span>
          </button>
        `;
      } else {
        actionHtml = '<span class="text-muted text-sm">Lunas</span>';
      }

      const borrowing = fine.borrowing || {};
      const memberName = borrowing.member ? borrowing.member.name : 'Unknown Member';
      const bookTitle = borrowing.book ? borrowing.book.title : 'Unknown Book';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>#FN-${fine.id}</strong></td>
        <td>${memberName}</td>
        <td>${bookTitle}</td>
        <td class="text-danger-soft"><strong>${formatCurrency(fine.amount)}</strong></td>
        <td><span class="badge ${statusClass}">${statusLabel}</span></td>
        <td>${formatDate(fine.paidAt)}</td>
        <td class="text-right">${actionHtml}</td>
      `;
      tbody.appendChild(row);
    });

    lucide.createIcons();

    // Hook pay actions
    document.querySelectorAll('.btn-pay-fine').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const amount = e.currentTarget.getAttribute('data-amount');
        if (confirm(`Konfirmasi pembayaran denda sebesar ${formatCurrency(amount)}?`)) {
          setGlobalLoading(true);
          try {
            await graphqlRequest(PAY_FINE, { fineId: id });
            showToast('Denda berhasil dibayar!', 'success');
            renderFines();
          } catch (err) {
            showToast(`Gagal membayar denda: ${err.message}`, 'error');
          } finally {
            setGlobalLoading(false);
          }
        }
      });
    });
    setGlobalLoading(false);
    
  } catch (error) {
    showToast(`Gagal memuat denda: ${error.message}`, 'error');
    setGlobalLoading('error');
  }
}

// ==========================================
// Modal Handlers
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    // Reset forms inside the modal
    const form = modal.querySelector('form');
    if (form) form.reset();
  }
}

// ==========================================
// Document Initialization & Event Listeners
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Load Initial View
  switchTab('dashboard');

  // Sidebar Menu Clicks
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const tabId = e.currentTarget.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // "View All borrowings" text button click on dashboard
  document.querySelector('.btn-view-all-borrowings').addEventListener('click', () => {
    switchTab('borrowings');
  });

  // Global Modal Close triggers (close button & overlay click)
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
    
    modal.querySelectorAll('.modal-close-btn, .btn-close-modal').forEach(closeBtn => {
      closeBtn.addEventListener('click', () => {
        closeModal(modal.id);
      });
    });
  });

  // --- Theme Toggle Logic ---
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  // Set theme from localStorage or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeIcon.setAttribute('data-lucide', 'sun');
  } else {
    document.body.classList.remove('light-theme');
    themeIcon.setAttribute('data-lucide', 'moon');
  }
  lucide.createIcons();

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeIcon.setAttribute('data-lucide', isLight ? 'sun' : 'moon');
    lucide.createIcons();
    showToast(`Mode ${isLight ? 'Terang' : 'Gelap'} diaktifkan`, 'info');
  });

  // --- Modal Openers ---
  document.getElementById('btn-open-add-book').addEventListener('click', () => {
    openModal('modal-add-book');
    // Set manual fields active initially
    document.getElementById('manual-fields').style.display = 'block';
    document.getElementById('book-title').required = true;
    document.getElementById('book-authors').required = true;
    document.getElementById('book-isbn').required = false;
    document.getElementById('btn-import-isbn').disabled = true;
  });

  document.getElementById('btn-open-add-member').addEventListener('click', () => openModal('modal-add-member'));
  document.getElementById('btn-open-add-category').addEventListener('click', () => openModal('modal-add-category'));
  document.getElementById('btn-open-borrow-book').addEventListener('click', () => {
    openModal('modal-borrow-book');
  });

  // --- Form Add Book Logic (ISBN Radio toggles) ---
  const radioManual = document.querySelector('input[name="input-mode"][value="manual"]');
  const radioISBN = document.querySelector('input[name="input-mode"][value="isbn"]');
  const manualFields = document.getElementById('manual-fields');
  const btnImportISBN = document.getElementById('btn-import-isbn');
  const bookTitleInput = document.getElementById('book-title');
  const bookAuthorsInput = document.getElementById('book-authors');
  const bookISBNInput = document.getElementById('book-isbn');

  const toggleInputMode = () => {
    if (radioManual.checked) {
      manualFields.style.display = 'block';
      bookTitleInput.required = true;
      bookAuthorsInput.required = true;
      bookISBNInput.required = false;
      btnImportISBN.disabled = true;
    } else {
      manualFields.style.display = 'none';
      bookTitleInput.required = false;
      bookAuthorsInput.required = false;
      bookISBNInput.required = true;
      btnImportISBN.disabled = false;
    }
  };

  radioManual.addEventListener('change', toggleInputMode);
  radioISBN.addEventListener('change', toggleInputMode);
  
  // Listen for ISBN input changes to enable/disable import button
  bookISBNInput.addEventListener('input', () => {
    if (radioISBN.checked) {
      btnImportISBN.disabled = bookISBNInput.value.trim().length < 5;
    }
  });

  btnImportISBN.addEventListener('click', () => {
    document.getElementById('form-add-book').requestSubmit();
  });

  // --- Submit Add Book Form ---
  document.getElementById('form-add-book').addEventListener('submit', async (e) => {
    e.preventDefault();
    setGlobalLoading(true);
    
    const isManual = radioManual.checked;
    const isbn = bookISBNInput.value.trim() || null;
    const stock = parseInt(document.getElementById('book-stock').value);
    const categoryId = document.getElementById('book-category-select').value;

    try {
      if (isManual) {
        const title = bookTitleInput.value.trim();
        const authors = bookAuthorsInput.value.split(',').map(a => a.trim()).filter(a => a.length > 0);
        
        await graphqlRequest(ADD_BOOK_MANUAL, {
          title,
          authors,
          isbn,
          stock,
          categoryId
        });
        showToast(`Buku "${title}" berhasil ditambahkan secara manual`, 'success');
      } else {
        // ISBN mode
        const res = await graphqlRequest(ADD_BOOK_BY_ISBN, {
          isbn,
          stock,
          categoryId
        });
        showToast(`Buku "${res.addBookByISBN.title}" berhasil diimport melalui ISBN`, 'success');
      }
      
      closeModal('modal-add-book');
      renderBooks();
    } catch (err) {
      showToast(`Gagal menambahkan buku: ${err.message}`, 'error');
    } finally {
      setGlobalLoading(false);
    }
  });

  // --- Submit Edit Stock Form ---
  document.getElementById('form-edit-stock').addEventListener('submit', async (e) => {
    e.preventDefault();
    setGlobalLoading(true);
    
    const id = document.getElementById('edit-stock-book-id').value;
    const stock = parseInt(document.getElementById('edit-stock-value').value);

    try {
      await graphqlRequest(UPDATE_BOOK_STOCK, { id, stock });
      showToast('Stok buku berhasil diupdate', 'success');
      closeModal('modal-edit-stock');
      renderBooks();
    } catch (err) {
      showToast(`Gagal mengupdate stok: ${err.message}`, 'error');
    } finally {
      setGlobalLoading(false);
    }
  });

  // --- Submit Add Member Form ---
  document.getElementById('form-add-member').addEventListener('submit', async (e) => {
    e.preventDefault();
    setGlobalLoading(true);
    
    const name = document.getElementById('member-name').value.trim();
    const phoneNumber = document.getElementById('member-phone').value.trim();

    try {
      await graphqlRequest(ADD_MEMBER, { name, phoneNumber });
      showToast(`Anggota "${name}" berhasil ditambahkan!`, 'success');
      closeModal('modal-add-member');
      renderMembers();
    } catch (err) {
      showToast(`Gagal menambahkan anggota: ${err.message}`, 'error');
    } finally {
      setGlobalLoading(false);
    }
  });

  // --- Submit Add Category Form ---
  document.getElementById('form-add-category').addEventListener('submit', async (e) => {
    e.preventDefault();
    setGlobalLoading(true);
    
    const name = document.getElementById('category-name').value.trim();

    try {
      await graphqlRequest(ADD_CATEGORY, { name });
      showToast(`Kategori "${name}" berhasil ditambahkan!`, 'success');
      closeModal('modal-add-category');
      renderCategories();
    } catch (err) {
      showToast(`Gagal menambahkan kategori: ${err.message}`, 'error');
    } finally {
      setGlobalLoading(false);
    }
  });

  // --- Submit Borrow Book Form ---
  document.getElementById('form-borrow-book').addEventListener('submit', async (e) => {
    e.preventDefault();
    setGlobalLoading(true);
    
    const memberId = document.getElementById('borrow-member-select').value;
    const bookId = document.getElementById('borrow-book-select').value;

    try {
      await graphqlRequest(BORROW_BOOK, { memberId, bookId });
      showToast('Transaksi peminjaman berhasil dibuat!', 'success');
      closeModal('modal-borrow-book');
      renderBorrowings();
    } catch (err) {
      showToast(`Gagal meminjam buku: ${err.message}`, 'error');
    } finally {
      setGlobalLoading(false);
    }
  });

  // --- Search & Filter Books dynamically ---
  document.getElementById('search-book-title').addEventListener('input', () => {
    // Debounce simple
    clearTimeout(window.searchDebounce);
    window.searchDebounce = setTimeout(() => {
      renderBooks();
    }, 300);
  });

  document.getElementById('filter-book-category').addEventListener('change', () => {
    renderBooks();
  });
});
