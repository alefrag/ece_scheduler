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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School, LogIn, ExternalLink } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";

const Login = () => {
  const { login, loginWithCAS, error } = useAuth();
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

  // Handle CAS callback
  useEffect(() => {
    const handleCASCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const ticket = urlParams.get("ticket");

      if (ticket) {
        try {
          setLoading(true);
          // In a real implementation, you would validate the CAS ticket with your backend
          // For now, we'll simulate a successful CAS login
          console.log("CAS ticket received:", ticket);

          // You would typically send the ticket to your backend to validate with CAS server
          // and then create a user session in Supabase

          // For demo purposes, we'll create a mock user
          const mockUser = {
            email: "cas.user@uop.gr",
            password: "cas-authenticated-user",
          };

          await login(mockUser.email, mockUser.password);
        } catch (error) {
          setLocalError("CAS authentication failed");
        } finally {
          setLoading(false);
        }
      }
    };

    handleCASCallback();
  }, [login]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      setLocalError(null);
      await login(email, password);
    } catch (error: any) {
      setLocalError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCASLogin = () => {
    setLocalError(null);
    loginWithCAS();
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
          <Tabs defaultValue="cas" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cas">CAS Login</TabsTrigger>
              <TabsTrigger value="email">Email Login</TabsTrigger>
            </TabsList>

            <TabsContent value="cas" className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Use your University of Patras credentials to sign in through
                  the CAS server.
                </p>
                <Button
                  onClick={handleCASLogin}
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {loading ? "Redirecting..." : "Sign in with CAS"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  You will be redirected to sso.uop.gr
                </p>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@uop.gr"
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
            </TabsContent>
          </Tabs>

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
              <p className="mt-1">support@uop.gr</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
