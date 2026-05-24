"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { getErrorMessage } from "@/lib/utils"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Check if user is admin (optional, depending on your business logic)
      if (data.data.user.role !== "admin") {
         throw new Error("Access denied. Admin only.")
      }

      // Set cookie for middleware
      document.cookie = `token=${data.data.token}; path=/; max-age=86400; SameSite=Strict`
      
      // Redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950 px-4">
      <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900 text-zinc-50">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Login to your account</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your admin email below to login
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-zinc-200">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@softsheba.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="grid gap-2 mb-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-200">Password</Label>
                <Link href="#" className="text-sm text-zinc-400 hover:text-zinc-300 hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="border-zinc-800 bg-zinc-950 text-white"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 bg-transparent border-t-0">
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
