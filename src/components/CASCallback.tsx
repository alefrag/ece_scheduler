import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const CASCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCASCallback = async () => {
      const ticket = searchParams.get("ticket");

      if (!ticket) {
        setStatus("error");
        setError("No CAS ticket provided");
        return;
      }

      try {
        // In a real implementation, you would:
        // 1. Send the ticket to your backend
        // 2. Backend validates ticket with CAS server
        // 3. Backend creates/updates user in database
        // 4. Backend returns user data or creates Supabase session

        // For demo purposes, we'll simulate this process
        console.log("Processing CAS ticket:", ticket);

        // Simulate CAS validation delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock user data that would come from CAS
        const casUserData = {
          email: "cas.user@uop.gr",
          name: "CAS User",
          role: "educator" as const,
        };

        // Check if user exists in our database
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("email", casUserData.email)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        let user = existingUser;

        // If user doesn't exist, create them
        if (!user) {
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert({
              email: casUserData.email,
              name: casUserData.name,
              role: casUserData.role,
            })
            .select()
            .single();

          if (createError) throw createError;
          user = newUser;
        }

        // Create a Supabase auth session
        // In a real implementation, this would be handled by your backend
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: casUserData.email,
          password: "cas-authenticated-user", // This would be handled differently in production
        });

        if (signInError) {
          // If the user doesn't exist in Supabase Auth, create them
          const { error: signUpError } = await supabase.auth.signUp({
            email: casUserData.email,
            password: "cas-authenticated-user",
          });

          if (signUpError) throw signUpError;
        }

        setStatus("success");

        // Redirect to dashboard after successful authentication
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      } catch (error: any) {
        console.error("CAS authentication error:", error);
        setStatus("error");
        setError(error.message || "Authentication failed");
      }
    };

    handleCASCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            {status === "processing" && "Authenticating..."}
            {status === "success" && "Authentication Successful"}
            {status === "error" && "Authentication Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === "processing" && (
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">
                Processing your CAS authentication...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-muted-foreground">
                Successfully authenticated! Redirecting to dashboard...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  {error || "An error occurred during authentication"}
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                Please try again or contact support if the problem persists.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CASCallback;
