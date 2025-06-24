import { useState, useEffect, createContext, useContext } from "react";
import { User } from "../types/database";
import { supabase } from "../lib/supabaseClient";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithCAS: () => void;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CAS_SERVER_URL =
    import.meta.env.VITE_CAS_SERVER_URL || "https://sso.uop.gr";
  const APP_URL = window.location.origin;

  useEffect(() => {
    // Check for existing session
    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      if (event === "SIGNED_IN" && session) {
        await fetchUserProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // If user profile doesn't exist, create one with default role
        if (error.code === "PGRST116") {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (authUser) {
            const { data: newUser, error: createError } = await supabase
              .from("users")
              .insert({
                id: authUser.id,
                email: authUser.email || "",
                name:
                  authUser.user_metadata?.name ||
                  authUser.email?.split("@")[0] ||
                  "User",
                role: "educator",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (createError) {
              console.error("Error creating user profile:", createError);
              // Fallback: create a basic user object
              const fallbackUser = {
                id: authUser.id,
                email: authUser.email || "",
                name:
                  authUser.user_metadata?.name ||
                  authUser.email?.split("@")[0] ||
                  "User",
                role: "educator" as const,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setUser(fallbackUser);
              return;
            }
            setUser(newUser);
            return;
          }
        }
        console.error("Database error:", error);
        setError("Failed to fetch user profile");
        return;
      }
      setUser(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Failed to fetch user profile");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setLoading(true);

      // Sign up the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (authError) throw authError;

      // Create user profile with default educator role
      if (authData.user) {
        const { error: profileError } = await supabase.from("users").insert({
          id: authData.user.id,
          email,
          name,
          role: "educator", // Default role for personal email registration
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't throw here as the auth user was created successfully
          // The profile will be created on first login if missing
        }
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithCAS = () => {
    const serviceUrl = encodeURIComponent(`${APP_URL}/auth/cas/callback`);
    const casLoginUrl = `${CAS_SERVER_URL}/cas/login?service=${serviceUrl}`;
    window.location.href = casLoginUrl;
  };

  const logout = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Also logout from CAS if needed
      const casLogoutUrl = `${CAS_SERVER_URL}/cas/logout?url=${encodeURIComponent(APP_URL)}`;
      window.location.href = casLogoutUrl;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    register,
    loginWithCAS,
    logout,
    error,
  };
};

export { AuthContext };
