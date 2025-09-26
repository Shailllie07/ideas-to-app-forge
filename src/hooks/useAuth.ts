// Legacy hook - use useAuthContext instead
import { useAuthContext } from "@/contexts/AuthContext";

export const useAuth = () => {
  return useAuthContext();
};