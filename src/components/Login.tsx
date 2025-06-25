import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { School, LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { login, error } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email?.trim() || !password) {
      setLocalError("Please enter both email and password");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setLocalError(null);
      setSuccessMessage(null);

      await login(email.trim(), password);
    } catch (error: any) {
      console.error("Login error in component:", error);
      const errorMessage = error.message || "Login failed. Please try again.";
      setLocalError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <School className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Course Timetable System</CardTitle>
          <CardDescription>
            Sign in to access the university course scheduling dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {successMessage && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {(error || localError) && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error || localError}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center space-y-4">
            <div className="text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <Button variant="link" size="sm" asChild className="p-0 h-auto">
                <Link to="/register">Register here</Link>
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Need help? Contact IT Support</p>
              <p className="mt-1">support@example.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
