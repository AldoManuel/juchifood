"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Lock, AlertCircle } from "lucide-react"

interface AuthProps {
  onLogin: (email: string, password: string) => Promise<boolean>
  onRegisterClick: () => void
  onBackClick: () => void
}

export default function Auth({ onLogin, onRegisterClick, onBackClick }: AuthProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Por favor completa todos los campos")
      setLoading(false)
      return
    }

    const success = await onLogin(email, password)
    if (!success) {
      setError("Credenciales incorrectas")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBackClick} className="mb-6 text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>

        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-800">
              JUCHI<span className="text-orange-500">FOOD</span>
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">Inicia sesión en tu cuenta</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-gray-600 mb-4">¿No tienes una cuenta?</p>
              <Button
                variant="outline"
                onClick={onRegisterClick}
                className="w-full h-12 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold rounded-xl bg-transparent"
              >
                Crear cuenta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
