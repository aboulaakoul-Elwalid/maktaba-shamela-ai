import { useContext } from "react";
import { AuthContext, AuthContextType } from "@/contexts/AuthContext"; // Adjust path if needed

/**
 * Custom hook to access the authentication context.
 * Provides authentication status, user data, and auth functions.
 * Must be used within an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
