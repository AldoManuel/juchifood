"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  LogOut,
  Mail,
  FileText,
  Package,
  DollarSign,
  Upload,
  X,
  Check,
  Edit,
  Trash2,
  User,
  Camera,
  AlertCircle,
} from "lucide-react"
import { productService, userService } from "@/lib/database"
import type { Database } from "@/lib/supabase"
import { uploadProfileImage, uploadProductImage, compressImageFile } from "@/lib/storage"

type Product = Database["public"]["Tables"]["products"]["Row"]
type UserType = Database["public"]["Tables"]["users"]["Row"]

interface UserAccountProps {
  user: UserType
  onLogout: () => void
}

export default function UserAccount({ user, onLogout }: UserAccountProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [currentUser, setCurrentUser] = useState(user)
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
  })
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user.name,
    description: user.description,
    location: user.location,
    profile_image: user.profile_image || "",
  })
  const [imagePreview, setImagePreview] = useState<string>("")
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")
  const [showSuccess, setShowSuccess] = useState("")
  const [showError, setShowError] = useState("")
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  const locations = ["DACyTI", "DAIA", "DACB", "Externo"]

  useEffect(() => {
    fetchProducts()
  }, [user.id])

  useEffect(() => {
    // Actualizar profileData cuando cambie el usuario
    setProfileData({
      name: currentUser.name,
      description: currentUser.description,
      location: currentUser.location,
      profile_image: currentUser.profile_image || "",
    })
  }, [currentUser])

  const fetchProducts = async () => {
    const userProducts = await productService.getByUserId(user.id)
    setProducts(userProducts)
  }

  const showSuccessMessage = (message: string) => {
    setShowSuccess(message)
    setTimeout(() => setShowSuccess(""), 3000)
  }

  const showErrorMessage = (message: string) => {
    setShowError(message)
    setTimeout(() => setShowError(""), 5000)
  }

  // Product Management Functions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!newProduct.name || !newProduct.price || !newProduct.description) {
      setLoading(false)
      return
    }

    const productData = {
      user_id: user.id,
      name: newProduct.name,
      price: Number.parseFloat(newProduct.price),
      description: newProduct.description,
      image_url: newProduct.image_url || null,
    }

    const savedProduct = await productService.create(productData)

    if (savedProduct) {
      setProducts((prev) => [savedProduct, ...prev])
      setNewProduct({ name: "", price: "", description: "", image_url: "" })
      setImagePreview("")
      showSuccessMessage("¡Producto agregado exitosamente!")
    } else {
      showErrorMessage("Error al agregar el producto")
    }

    setLoading(false)
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setLoading(true)

    const updatedProduct = await productService.update(editingProduct.id, {
      name: editingProduct.name,
      price: Number(editingProduct.price) || 0,
      description: editingProduct.description,
      image_url: editingProduct.image_url,
    })

    if (updatedProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p)))
      setEditingProduct(null)
      showSuccessMessage("¡Producto actualizado exitosamente!")
    } else {
      showErrorMessage("Error al actualizar el producto")
    }

    setLoading(false)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      const success = await productService.delete(productId)
      if (success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId))
        showSuccessMessage("¡Producto eliminado exitosamente!")
      } else {
        showErrorMessage("Error al eliminar el producto")
      }
    }
  }

  // Profile Management Functions
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updatedUser = await userService.update(user.id, {
        name: profileData.name,
        description: profileData.description,
        location: profileData.location,
        profile_image: profileImagePreview || profileData.profile_image || null,
      })

      if (updatedUser) {
        setCurrentUser(updatedUser)
        setEditingProfile(false)
        setProfileImagePreview("")
        showSuccessMessage("¡Perfil actualizado exitosamente!")
      } else {
        showErrorMessage("Error al actualizar el perfil")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      showErrorMessage("Error al actualizar el perfil. La imagen puede ser demasiado grande.")
    }

    setLoading(false)
  }

  // Image Upload Functions
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageLoading(true)

    try {
      // Comprimir imagen antes de subir
      const compressedFile = await compressImageFile(file, 800, 0.8)

      // Subir a Supabase Storage
      const result = await uploadProductImage(compressedFile, user.id)

      if (result.success && result.url) {
        setImagePreview(result.url)
        if (editingProduct) {
          setEditingProduct({ ...editingProduct, image_url: result.url })
        } else {
          setNewProduct((prev) => ({ ...prev, image_url: result.url }))
        }
        showSuccessMessage("¡Imagen subida exitosamente!")
      } else {
        showErrorMessage(result.error || "Error al subir la imagen")
      }
    } catch (error) {
      showErrorMessage("Error al procesar la imagen")
    }

    setImageLoading(false)
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageLoading(true)

    try {
      // Comprimir imagen antes de subir
      const compressedFile = await compressImageFile(file, 400, 0.7)

      // Subir a Supabase Storage
      const result = await uploadProfileImage(compressedFile, user.id)

      if (result.success && result.url) {
        setProfileImagePreview(result.url)
        showSuccessMessage("¡Imagen de perfil subida exitosamente!")
      } else {
        showErrorMessage(result.error || "Error al subir la imagen de perfil")
      }
    } catch (error) {
      showErrorMessage("Error al procesar la imagen")
    }

    setImageLoading(false)
  }

  const removeImage = () => {
    setImagePreview("")
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, image_url: "" })
    } else {
      setNewProduct((prev) => ({ ...prev, image_url: "" }))
    }
  }

  const removeProfileImage = () => {
    setProfileImagePreview("")
  }

  const cancelProfileEdit = () => {
    setEditingProfile(false)
    setProfileImagePreview("")
    setProfileData({
      name: currentUser.name,
      description: currentUser.description,
      location: currentUser.location,
      profile_image: currentUser.profile_image || "",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          JUCHI<span className="text-orange-500">FOOD</span>
        </h1>
        <Button
          onClick={onLogout}
          variant="outline"
          className="border-2 border-gray-300 hover:border-red-500 hover:text-red-500 bg-transparent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <Check className="h-4 w-4" />
          <span className="text-sm">{showSuccess}</span>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="mb-6 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{showError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Info */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">Mi Perfil</CardTitle>
                <CardDescription className="text-orange-100">Información de tu cuenta</CardDescription>
              </div>
              <Button
                onClick={() => setEditingProfile(true)}
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Profile Image */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-orange-200">
                  {currentUser.profile_image ? (
                    <img
                      src={currentUser.profile_image || "/placeholder.svg"}
                      alt="Perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Foto de perfil</p>
                <p className="font-semibold text-gray-800 text-lg">{currentUser.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Correo electrónico</p>
                <p className="font-semibold text-gray-800">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-orange-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Descripción</p>
                <p className="font-semibold text-gray-800 leading-relaxed">{currentUser.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Ubicación</p>
                <p className="font-semibold text-gray-800">{currentUser.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Product */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-t-2xl">
            <CardTitle className="text-2xl font-bold">Agregar Producto</CardTitle>
            <CardDescription className="text-gray-200">Añade un nuevo producto a tu menú</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName" className="text-sm font-medium text-gray-700">
                  Nombre del producto
                </Label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="productName"
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                    placeholder="Ej: Tacos de carnitas"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productPrice" className="text-sm font-medium text-gray-700">
                  Precio
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="productPrice"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productDescription" className="text-sm font-medium text-gray-700">
                  Descripción del producto
                </Label>
                <Textarea
                  id="productDescription"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                  className="min-h-[80px] border-2 border-gray-200 focus:border-orange-500 rounded-xl resize-none"
                  placeholder="Describe tu producto..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Imagen del producto</Label>

                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">
                      {imageLoading ? "Procesando imagen..." : "Haz clic para subir una imagen"}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUpload"
                      disabled={imageLoading}
                    />
                    <Label
                      htmlFor="imageUpload"
                      className={`cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium ${
                        imageLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {imageLoading ? "Procesando..." : "Seleccionar imagen"}
                    </Label>
                    <p className="text-xs text-gray-400 mt-2">Máximo 5MB - JPG, PNG, WebP</p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Vista previa"
                      className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full w-8 h-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || imageLoading}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg"
              >
                {loading ? "Guardando..." : "Guardar producto"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      {products.length > 0 && (
        <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Mis Productos</CardTitle>
            <CardDescription>Productos que has agregado a tu menú</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {product.image_url && (
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800 flex-1">{product.name}</h3>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProduct(product)}
                          className="p-1 h-8 w-8"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-orange-500 font-semibold text-xl mb-2">${product.price.toFixed(2)}</p>
                    <p className="text-gray-600 text-sm">{product.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>Actualiza la información de tu perfil y puesto de comida.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Profile Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Foto de perfil</Label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-orange-200">
                  {profileImagePreview || currentUser.profile_image ? (
                    <img
                      src={profileImagePreview || currentUser.profile_image || ""}
                      alt="Perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                      id="profileImageUpload"
                      disabled={imageLoading}
                    />
                    <Label
                      htmlFor="profileImageUpload"
                      className={`cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center ${
                        imageLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Camera className="w-4 h-4 mr-1" />
                      {imageLoading ? "Procesando..." : currentUser.profile_image ? "Cambiar" : "Subir"}
                    </Label>
                  </div>
                  {(profileImagePreview || currentUser.profile_image) && (
                    <Button
                      type="button"
                      onClick={removeProfileImage}
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-700 bg-transparent text-xs"
                      disabled={imageLoading}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Eliminar
                    </Button>
                  )}
                  <p className="text-xs text-gray-400">Máximo 5MB - JPG, PNG, WebP</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileName" className="text-sm font-medium text-gray-700">
                Nombre del puesto
              </Label>
              <Input
                id="profileName"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileDescription" className="text-sm font-medium text-gray-700">
                Descripción
              </Label>
              <Textarea
                id="profileDescription"
                value={profileData.description}
                onChange={(e) => setProfileData((prev) => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px] border-2 border-gray-200 focus:border-orange-500 rounded-xl resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileLocation" className="text-sm font-medium text-gray-700">
                Ubicación
              </Label>
              <Select
                value={profileData.location}
                onValueChange={(value) => setProfileData((prev) => ({ ...prev, location: value }))}
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl">
                  <SelectValue />
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={cancelProfileEdit} disabled={loading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || imageLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Actualiza la información de tu producto.</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editProductName" className="text-sm font-medium text-gray-700">
                  Nombre del producto
                </Label>
                <Input
                  id="editProductName"
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editProductPrice" className="text-sm font-medium text-gray-700">
                  Precio
                </Label>
                <Input
                  id="editProductPrice"
                  type="number"
                  step="0.01"
                  value={editingProduct.price.toString()}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: Number.parseFloat(e.target.value) || 0 })
                  }
                  className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editProductDescription" className="text-sm font-medium text-gray-700">
                  Descripción
                </Label>
                <Textarea
                  id="editProductDescription"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="min-h-[80px] border-2 border-gray-200 focus:border-orange-500 rounded-xl resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Imagen del producto</Label>
                {editingProduct.image_url ? (
                  <div className="relative">
                    <img
                      src={editingProduct.image_url || "/placeholder.svg"}
                      alt="Vista previa"
                      className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, image_url: "" })}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full w-8 h-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="editImageUpload"
                      disabled={imageLoading}
                    />
                    <Label
                      htmlFor="editImageUpload"
                      className={`cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium ${
                        imageLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {imageLoading ? "Procesando..." : "Seleccionar imagen"}
                    </Label>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || imageLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {loading ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
