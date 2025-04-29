"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth"; // Use the created hook
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginDialog() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null); // Error specific to this dialog

  // Get auth functions and state from context
  const { login, isLoading, error: authError } = useAuth(); // Use authError for context errors

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null); // Clear previous local errors

    try {
      await login(email, password);
      // If login is successful (no error thrown by the hook)
      setIsOpen(false); // Close the dialog on success
      setEmail(""); // Clear fields
      setPassword("");
    } catch (err: any) {
      // Error is already set in the AuthContext, but we can also show it locally
      setLocalError(
        err.message || "Login failed. Please check your credentials."
      );
      console.error("Login Dialog Error:", err);
    }
  };

  // Combine local error and auth context error for display
  const displayError = localError || authError;

  // Reset local error when dialog opens or closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setLocalError(null);
      // Optionally clear fields when closing without success
      // setEmail("");
      // setPassword("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Login</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your chat history.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin}>
          {displayError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              {/* <AlertTitle>Error</AlertTitle> */}
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-login" className="text-right">
                Email
              </Label>
              <Input
                id="email-login"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password-login" className="text-right">
                Password
              </Label>
              <Input
                id="password-login"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Login
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
