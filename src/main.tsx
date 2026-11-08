import { createRoot } from "react-dom/client";
import App from "./App";
import "./stil.css";

const wurzel = document.getElementById("wurzel");
if (wurzel) createRoot(wurzel).render(<App />);
