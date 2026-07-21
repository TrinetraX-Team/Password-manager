import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// For Tauri to work properly in dev mode, we need to ensure the script is loaded
// This is handled by Tauri automatically, but we add a small delay to be safe
setTimeout(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}, 0);
