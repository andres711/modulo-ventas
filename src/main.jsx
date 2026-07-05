import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const THEME_STORAGE_KEY = "app.theme";

function getInitialTheme() {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const root = window.document.documentElement;
  const body = window.document.body;
  const appRoot = window.document.getElementById("root");
  const isDarkTheme = theme === "dark";

  root.classList.toggle("dark", isDarkTheme);
  body.classList.toggle("dark", isDarkTheme);
  appRoot?.classList.toggle("dark", isDarkTheme);
  root.dataset.theme = theme;
  body.dataset.theme = theme;
  if (appRoot) appRoot.dataset.theme = theme;
  root.style.colorScheme = theme;
  body.style.colorScheme = theme;
  if (appRoot) appRoot.style.colorScheme = theme;
}

applyTheme(getInitialTheme());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
