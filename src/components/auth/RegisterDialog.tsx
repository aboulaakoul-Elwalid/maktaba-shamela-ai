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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"; // Icons
import { Alert, AlertDescription } from "@/components/ui/alert"; // For errors

export function RegisterDialog() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // State for success message

  // Get auth functions and state from context
  // Note: We use 'isLoading' and 'error' from useAuth, assuming registration uses the same state
  const { register, isLoading, error } = useAuth();

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setShowSuccess(false); // Reset success message

    if (password !== confirmPassword) {
      // Handle password mismatch locally (or rely on backend validation)
      alert("Passwords do not match!"); // Simple alert for now
      return;
    }

    try {
      await register(name, email, password);
      // If register is successful (no error thrown)
      setShowSuccess(true); // Show success message
      setName(""); // Clear fields
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      // Keep the dialog open to show the success message, or close after a delay:
      // setTimeout(() => setIsOpen(false), 3000);
    } catch (err) {
      // Error is already set in AuthContext by the register function
      console.error("Registration attempt failed in component");
      setShowSuccess(false); // Ensure success message is hidden on error
    }
  };

  // Reset state when dialog is closed/opened
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset fields and messages when closing
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setShowSuccess(false);
      // Consider clearing the global error state in AuthContext if desired,
      // or let it persist until the next auth action.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {/* Add a button or link somewhere to trigger this dialog */}
        <Button variant="link">Register</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleRegister}>
          <DialogHeader>
            <DialogTitle>Register</DialogTitle>
            <DialogDescription>
              Create your account to save conversations.
            </DialogDescription>
          </DialogHeader>

          {/* Display Success Message */}
          {showSuccess && (
            <Alert
              variant="default"
              className="bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300 my-4"
            >
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Registration successful! You can now log in.
              </AlertDescription>
            </Alert>
          )}

          {/* Display Registration Error */}
          {error &&
            !showSuccess && ( // Only show error if not showing success
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                disabled={isLoading || showSuccess}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-register" className="text-right">
                {" "}
                {/* Unique ID */}
                Email
              </Label>
              <Input
                id="email-register"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
                disabled={isLoading || showSuccess}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password-register" className="text-right">
                {" "}
                {/* Unique ID */}
                Password
              </Label>
              <Input
                id="password-register"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                required
                disabled={isLoading || showSuccess}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirm-password" className="text-right">
                Confirm
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="col-span-3"
                required
                disabled={isLoading || showSuccess}
              />
            </div>
          </div>
          <DialogFooter>
            {/* Hide button if registration was successful */}
            {!showSuccess && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            )}
            {/* Optionally add a close button or login redirect button after success */}
            {showSuccess && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
