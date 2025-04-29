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
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth"; // Corrected import path
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RegisterDialog() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { register, isLoading, error: authError } = useAuth();

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    setShowSuccess(false);

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await register(name, email, password);
      setShowSuccess(true);
      setTimeout(() => {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setIsOpen(false);
        setShowSuccess(false);
      }, 2000);
    } catch (err: any) {
      setLocalError(err.message || "Registration failed. Please try again.");
      console.error("Register Dialog Error:", err);
    }
  };

  const displayError = localError || authError;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setLocalError(null);
      setShowSuccess(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Register</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register</DialogTitle>
          <DialogDescription>
            Create an account to save your chat history.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleRegister}>
          {displayError && !showSuccess && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}
          {showSuccess && (
            <Alert
              variant="default"
              className="mb-4 border-green-500 text-green-700"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Registration successful! You can now log in.
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name-register" className="text-right">
                Name
              </Label>
              <Input
                id="name-register"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="col-span-3"
                disabled={isLoading || showSuccess}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-register" className="text-right">
                Email
              </Label>
              <Input
                id="email-register"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="col-span-3"
                disabled={isLoading || showSuccess}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password-register" className="text-right">
                Password
              </Label>
              <Input
                id="password-register"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="col-span-3"
                disabled={isLoading || showSuccess}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirm-password-register" className="text-right">
                Confirm
              </Label>
              <Input
                id="confirm-password-register"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="col-span-3"
                disabled={isLoading || showSuccess}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                disabled={isLoading || showSuccess}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || showSuccess}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Register
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
