import { useAuth } from "@clerk/react";
import { useEffect, useRef } from "react";
import { RouterProvider } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "./router.jsx";

export function App() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const queryClient = useQueryClient();
  const previousUserId = useRef(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || (previousUserId.current && previousUserId.current !== userId)) {
      queryClient.clear();
    }

    previousUserId.current = isSignedIn ? userId : null;
  }, [isLoaded, isSignedIn, queryClient, userId]);

  return <RouterProvider router={router} />;
}
