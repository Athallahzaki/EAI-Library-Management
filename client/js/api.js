/**
 * api.js - GraphQL API Client & Query Definitions
 */

const GRAPHQL_ENDPOINT = `/graphql`;

/**
 * Helper to make a GraphQL request.
 * Handles HTTP errors and GraphQL errors.
 * @param {string} query - The GraphQL query or mutation string
 * @param {object} variables - Optional variables for the query
 * @returns {Promise<any>} Response data object
 */
export async function graphqlRequest(query, variables = {}) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors && result.errors.length > 0) {
      const messages = result.errors.map(err => err.message).join(', ');
      throw new Error(messages);
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL Request failed:', error);
    throw error;
  }
}

// ==========================================
// GraphQL Queries & Mutations definitions
// ==========================================

export const GET_DASHBOARD_DATA = `
  query GetDashboardData {
    books {
      id
      stock
      availableStock
    }
    members {
      id
    }
    borrowings {
      id
      borrowDate
      dueDate
      returnDate
      status
      member {
        name
      }
      book {
        title
      }
    }
    fines {
      id
      amount
      status
    }
  }
`;

export const GET_BOOKS = `
  query GetBooks($categoryId: ID, $title: String) {
    books(categoryId: $categoryId, title: $title) {
      id
      isbn
      title
      authors
      coverImage
      stock
      availableStock
      category {
        id
        name
      }
    }
    categories {
      id
      name
    }
  }
`;

export const GET_MEMBERS = `
  query GetMembers {
    members {
      id
      name
      phoneNumber
      activeBorrowings
    }
  }
`;

export const GET_BORROWINGS = `
  query GetBorrowings {
    borrowings {
      id
      borrowDate
      dueDate
      returnDate
      status
      book {
        id
        title
      }
      member {
        id
        name
      }
      fine {
        id
        amount
        status
      }
    }
    books {
      id
      title
      availableStock
    }
    members {
      id
      name
    }
  }
`;

export const GET_FINES = `
  query GetFines {
    fines {
      id
      amount
      status
      paidAt
      borrowing {
        id
        borrowDate
        dueDate
        returnDate
        member {
          name
        }
        book {
          title
        }
      }
    }
  }
`;

export const GET_CATEGORIES = `
  query GetCategories {
    categories {
      id
      name
      books {
        id
      }
    }
  }
`;

// Mutations
export const ADD_BOOK_MANUAL = `
  mutation AddBookManual($title: String!, $authors: [String!], $isbn: String, $stock: Int!, $categoryId: ID!) {
    addBookManual(title: $title, authors: $authors, isbn: $isbn, stock: $stock, categoryId: $categoryId) {
      id
      title
      stock
    }
  }
`;

export const ADD_BOOK_BY_ISBN = `
  mutation AddBookByISBN($isbn: String!, $stock: Int!, $categoryId: ID!) {
    addBookByISBN(isbn: $isbn, stock: $stock, categoryId: $categoryId) {
      id
      title
      stock
    }
  }
`;

export const UPDATE_BOOK_STOCK = `
  mutation UpdateBookStock($id: ID!, $stock: Int!) {
    updateBookStock(id: $id, stock: $stock) {
      id
      stock
      availableStock
    }
  }
`;

export const DELETE_BOOK = `
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id)
  }
`;

export const ADD_CATEGORY = `
  mutation AddCategory($name: String!) {
    addCategory(name: $name) {
      id
      name
    }
  }
`;

export const DELETE_CATEGORY = `
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const ADD_MEMBER = `
  mutation AddMember($name: String!, $phoneNumber: String!) {
    addMember(name: $name, phoneNumber: $phoneNumber) {
      id
      name
      phoneNumber
    }
  }
`;

export const DELETE_MEMBER = `
  mutation DeleteMember($id: ID!) {
    deleteMember(id: $id)
  }
`;

export const BORROW_BOOK = `
  mutation BorrowBook($memberId: ID!, $bookId: ID!) {
    borrowBook(memberId: $memberId, bookId: $bookId) {
      id
      borrowDate
      dueDate
      status
    }
  }
`;

export const RETURN_BOOK = `
  mutation ReturnBook($borrowingId: ID!) {
    returnBook(borrowingId: $borrowingId) {
      id
      returnDate
      status
      fine {
        id
        amount
        status
      }
    }
  }
`;

export const PAY_FINE = `
  mutation PayFine($fineId: ID!) {
    payFine(fineId: $fineId) {
      id
      status
      paidAt
    }
  }
`;
