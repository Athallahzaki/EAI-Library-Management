const axios = require("axios");
const GOOGLE_BOOK_API =
  "https://www.googleapis.com/books/v1/volumes";
const KEY = process.env.GOOGLE_KEY;

async function fetchBook(isbn) {
  try {
    const response =
      await axios.get(
        GOOGLE_BOOK_API,
        {
          params: {
            q: `isbn:${isbn}`,
            ...(KEY && { key: KEY })
          }
        }
      );

    const items =
      response.data.items;

    if (!items || items.length === 0) {
      throw new Error(
        "Book not found from ISBN"
      );
    }

    const info =
      items[0].volumeInfo;

    return {
      isbn,
      title:
        info.title || "Unknown Title",
      authors:
        info.authors || [],
      coverImage:
        info.imageLinks?.thumbnail
        || null
    };
  } catch (error) {
    if (
      error.response
    ) {
      throw new Error(
        "Failed fetching ISBN data"
      );
    }
    throw error;
  }
}

module.exports = {
  fetchBook
};