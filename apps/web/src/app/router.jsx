import { createBrowserRouter } from "react-router-dom";
import { EditorPage } from "../pages/EditorPage.jsx";
import { NotFoundPage } from "../pages/NotFoundPage.jsx";
import { SignInPage } from "../features/auth/SignInPage.jsx";
import { SignUpPage } from "../features/auth/SignUpPage.jsx";
import { HomeRedirect, ProtectedRoute } from "../features/auth/protected-route.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRedirect />,
  },
  {
    path: "/sign-in/*",
    element: <SignInPage />,
  },
  {
    path: "/sign-up/*",
    element: <SignUpPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/editor",
        element: <EditorPage />,
      },
      {
        path: "/editor/:projectId",
        element: <EditorPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
