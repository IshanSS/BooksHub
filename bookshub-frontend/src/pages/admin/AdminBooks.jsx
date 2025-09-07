import React, { useEffect, useState } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const AdminBooks = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/books", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setBooks(data);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/admin/books/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setBooks(books.filter((b) => b._id !== id));
  };

  return (
    <div>
      <Typography variant="h6">Books</Typography>
      <List>
        {books.map((book) => (
          <ListItem
            key={book._id}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDelete(book._id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={book.title}
              secondary={book.owner ? book.owner.name : ""}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default AdminBooks;
