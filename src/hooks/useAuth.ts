import { useState, useEffect, createContext, useContext } from "react";
import { User } from "../types/database";
import { supabase } from "../lib/supabaseClient";
import type { AuthError } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
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
      setError(null);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // If user profile doesn't exist, create one with default role
        if (error.code === "PGRST116") {
          console.log("User profile not found, creating new profile");
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();

          if (authUser) {
            const newUserData = {
              id: authUser.id,
              email: authUser.email || "",
              name:
                authUser.user_metadata?.name ||
                authUser.user_metadata?.full_name ||
                authUser.email?.split("@")[0] ||
                "User",
              role: "educator" as const,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            const { data: newUser, error: createError } = await supabase
              .from("users")
              .insert(newUserData)
              .select()
              .single();

            if (createError) {
              console.error("Error creating user profile:", createError);
              // Fallback: create a basic user object for the session
              setUser(newUserData);
              return;
            }

            console.log("User profile created successfully");
            setUser(newUser);
            return;
          }
        }

        console.error("Database error:", error);
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }

      setUser(data);
      console.log("User profile loaded successfully");
    } catch (error: any) {
      console.error("Error in fetchUserProfile:", error);
      setError(error.message || "Failed to fetch user profile");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      console.log("Attempting to sign in user:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }

      if (data.user) {
        console.log("Login successful for user:", data.user.id);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.message || "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setLoading(true);

      console.log("Attempting to register user:", email);

      // Sign up the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            full_name: name.trim(),
          },
        },
      });

      if (authError) {
        console.error("Registration auth error:", authError);
        throw authError;
      }

      console.log("Auth registration successful");

      // Create user profile with default educator role
      if (authData.user && !authData.user.identities?.length) {
        // User needs email confirmation
        console.log("User needs email confirmation");
      } else if (authData.user) {
        console.log("Creating user profile");
        const { error: profileError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: email.trim(),
          name: name.trim(),
          role: "educator", // Default role for personal email registration
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't throw here as the auth user was created successfully
          // The profile will be created on first login if missing
        } else {
          console.log("User profile created successfully");
        }
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      const errorMessage = error.message || "Registration failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      console.log("Logging out user");

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }

      setUser(null);
      console.log("Logout successful");
    } catch (error: any) {
      console.error("Logout failed:", error);
      const errorMessage = error.message || "Logout failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    error,
  };
};

export { AuthContext };
