"use client"

import { useState, useEffect } from "react"
import Home from "@/components/home"
import Auth from "@/components/auth"
import Register from "@/components/register"
import UserAccount from "@/components/user-account"
import { userService, authService } from "@/lib/database"
import type { Database } from "@/lib/supabase"

type User = Database["public"]["Tables"]["users"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"]

export default function JuchiFoodApp() {
  const [currentView, setCurrentView] = useState<"home" | "auth" | "register" | "account">("home")
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    // Por ahora no verificamos usuario actual
    // En una app real aquí verificarías la sesión del usuario
  }, [])

  const handleLogin = async (email: string, password: string) => {
    const user = await authService.login(email, password)
    if (user) {
      setCurrentUser(user)
      setCurrentView("account")
      return true
    }
    return false
  }

  const handleRegister = async (userData: Omit<User, "id" | "created_at">) => {
    const newUser = await userService.create(userData)
    if (newUser) {
      setCurrentUser(newUser)
      setCurrentView("account")
      return true
    }
    return false
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentView("home")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {currentView === "home" && <Home onAuthClick={() => setCurrentView("auth")} />}

      {currentView === "auth" && (
        <Auth
          onLogin={handleLogin}
          onRegisterClick={() => setCurrentView("register")}
          onBackClick={() => setCurrentView("home")}
        />
      )}

      {currentView === "register" && (
        <Register onRegister={handleRegister} onBackClick={() => setCurrentView("auth")} />
      )}

      {currentView === "account" && currentUser && <UserAccount user={currentUser} onLogout={handleLogout} />}
    </div>
  )
}
