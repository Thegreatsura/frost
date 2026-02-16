"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthInfo = {
  demoMode?: boolean;
  demoPassword?: string | null;
  devPassword?: string | null;
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [demoPassword, setDemoPassword] = useState<string | null>(null);
  const [devPassword, setDevPassword] = useState<string | null>(null);

  useEffect(() => {
    async function loadAuthInfo() {
      try {
        const res = await fetch("/api/auth/dev-info");
        const data = (await res.json()) as AuthInfo;
        const fetchedDevPassword =
          typeof data.devPassword === "string" && data.devPassword.length > 0
            ? data.devPassword
            : null;
        const fetchedDemoPassword =
          typeof data.demoPassword === "string" && data.demoPassword.length > 0
            ? data.demoPassword
            : null;
        const nextDemoMode = data.demoMode === true;

        setDevPassword(fetchedDevPassword);
        setDemoMode(nextDemoMode);
        setDemoPassword(fetchedDemoPassword);

        if (nextDemoMode && fetchedDemoPassword) {
          setPassword(fetchedDemoPassword);
        }
      } catch {}
    }

    loadAuthInfo();
  }, []);

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "same-origin",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Login failed");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-medium text-neutral-100">
              Frost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-neutral-300">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type={demoMode ? "text" : "password"}
                  required
                  autoFocus
                  value={password}
                  onChange={handlePasswordChange}
                  className="border-neutral-700 bg-neutral-800 text-neutral-100"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              {demoMode && demoPassword && (
                <p className="text-sm text-neutral-500">
                  Demo password:{" "}
                  <code className="text-neutral-400">{demoPassword}</code>
                </p>
              )}

              {devPassword && (
                <p className="text-sm text-neutral-500">
                  Dev mode password:{" "}
                  <code className="text-neutral-400">{devPassword}</code>
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Signing in
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
