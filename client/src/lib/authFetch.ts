import { useAuth } from "@clerk/clerk-react";

// Hook to get authenticated fetch function
export function useAuthenticatedFetch() {
  const { getToken, isSignedIn } = useAuth();

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (isSignedIn) {
      const token = await getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return fetch(url, { ...options, headers });
  };

  return { authFetch, isSignedIn };
}
