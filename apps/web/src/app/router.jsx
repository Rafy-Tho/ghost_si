import { createBrowserRouter } from "react-router-dom";
import { StartupPage } from "../pages/StartupPage.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <StartupPage />,
  },
]);
