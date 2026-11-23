import { createRoot } from "react-dom/client";
import "./app/registerDevExtremeLicense";
import "./styles/index.css";

void import("./app/App").then(({ default: App }) => {
  createRoot(document.getElementById("root")!).render(<App />);
});
