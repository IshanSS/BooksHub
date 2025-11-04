import React, { useEffect, useState, useRef } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

/**
 * Simple debounced search input.
 * Props:
 *  - value (string)
 *  - onChange (fn) called with new value (debounced)
 *  - delay (ms) debounce delay (default 300)
 *  - placeholder (string)
 */
export default function SearchBar({
  value: initial = "",
  onChange,
  delay = 300,
  placeholder = "Search...",
}) {
  const [value, setValue] = useState(initial);
  const timer = useRef(null);

  useEffect(() => {
    setValue(initial || "");
  }, [initial]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (typeof onChange === "function") onChange(value);
    }, delay);
    return () => clearTimeout(timer.current);
  }, [value, delay, onChange]);

  return (
    <TextField
      label={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      fullWidth
      variant="outlined"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {value ? (
              <IconButton
                size="small"
                onClick={() => {
                  setValue("");
                  if (typeof onChange === "function") onChange("");
                }}
              >
                <ClearIcon />
              </IconButton>
            ) : null}
          </InputAdornment>
        ),
      }}
    />
  );
}
