"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSignIn() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(`Sign in failed: ${error.message}`);
      setError(error.message);
      setLoading(false);
    } else {
      toast.success("Successfully signed in!");
      // Hard redirect to ensure server-side auth sync with middleware
      window.location.href = "/dashboard/create";
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-8" style={{ backgroundColor: "white" }}>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/logo.png"
              alt="Muse logo"
              width={36}
              height={36}
              className="shrink-0 rounded-lg"
            />
            <h1 className="text-3xl font-bold text-gray-900">Muse</h1>
          </div>
          <CardTitle className="text-center">Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button onClick={handleSignIn} disabled={loading} className="w-full">
            {loading ? "Loading..." : "Sign In"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}