import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { School, UserPlus, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Registration = () => {
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Enhanced validation
    if (
      !formData.name?.trim() ||
      !formData.email?.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setLocalError("Please fill in all required fields");
      return;
    }

    if (formData.name.trim().length < 2) {
      setLocalError("Name must be at least 2 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return;
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setLocalError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await register(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
      );
      setSuccess(true);

      // Redirect to login after successful registration
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Registration successful! Please check your email to verify your account before signing in.",
          },
        });
      }, 2000);
    } catch (error: any) {
      console.error("Registration error in component:", error);
      setLocalError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-6 w-6 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <CardTitle className="text-2xl text-green-600">
              Registration Successful!
            </CardTitle>
            <CardDescription>
              Your account has been created with instructor privileges. Please
              check your email to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              You will be redirected to the login page shortly...
            </p>
            <Button asChild variant="outline">
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <School className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Register for the Course Timetable System with instructor privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter a secure password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your account will be created with
                educator privileges, allowing you to set availability
                preferences and view schedules.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {(error || localError) && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error || localError}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login" className="flex items-center">
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back to Login
                </Link>
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

export default Registration;
