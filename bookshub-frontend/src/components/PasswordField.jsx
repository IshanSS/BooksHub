import React, { useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

/**
 * Props: label, value, onChange, required, name, fullWidth, variant...
 */
export default function PasswordField(props) {
  const { value, onChange, label = "Password", ...rest } = props;
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...rest}
      label={label}
      type={visible ? "text" : "password"}
      value={value}
      onChange={onChange}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setVisible((v) => !v)}
              edge="end"
              size="large"
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
