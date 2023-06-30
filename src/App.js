import React, { useState } from "react";
import Home from "./components/Home";
import { Typography } from "@mui/material";

const App = () => {
  const [apiKey, setApiKey] = useState("4d5ff9ee7debcb92a90a22c352ad1775");

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
  };

  return (
    <div className="App">
      <Typography align="center" variant="h1" sx={{ marginBottom: "16px" }}>
        Movies & TV Shows
      </Typography>

      <input type="text" placeholder="Enter API key" value={apiKey} onChange={handleApiKeyChange} />

      <Home apiKey={apiKey} />
    </div>
  );
};

export default App;
