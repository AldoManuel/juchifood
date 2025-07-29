"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Lock, FileText, MapPin, AlertCircle } from "lucide-react"
import type { Database } from "@/lib/supabase"

type User = Database["public"]["Tables"]["users"]["Row"]

interface RegisterProps {
  onRegister: (userData: Omit<User, "id" | "created_at">) => Promise<boolean>
  onBackClick: () => void
}

export default function Register({ onRegister, onBackClick }: RegisterProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    description: "",
    location: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const locations = ["DACyTI", "DAIA", "DACB", "Externo"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validación
    if (!formData.email || !formData.password || !formData.name || !formData.description || !formData.location) {
      setError("Por favor completa todos los campos")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    const success = await onRegister(formData)
    if (!success) {
      setError("Error al crear la cuenta")
    }
    setLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBackClick} className="mb-6 text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al login
        </Button>

        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-800">
              JUCHI<span className="text-orange-500">FOOD</span>
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">Crea tu cuenta de vendedor</CardDescription>
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
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
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
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nombre del puesto
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                    placeholder="Nombre de tu puesto de comida"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Descripción
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="pl-10 pt-3 min-h-[80px] border-2 border-gray-200 focus:border-orange-500 rounded-xl resize-none"
                    placeholder="Describe tu puesto y especialidades..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                  Ubicación
                </Label>
                <Select onValueChange={(value) => handleInputChange("location", value)}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Selecciona tu ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                {loading ? "Creando cuenta..." : "Registrar Cuenta"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
