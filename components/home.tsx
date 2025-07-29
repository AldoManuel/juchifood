"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, MapPin, LogIn, ArrowLeft, Package } from "lucide-react"
import { userService, productService } from "@/lib/database"
import type { Database } from "@/lib/supabase"

type UserType = Database["public"]["Tables"]["users"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"]

interface HomeProps {
  onAuthClick: () => void
}

export default function Home({ onAuthClick }: HomeProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [selectedVendor, setSelectedVendor] = useState<UserType | null>(null)
  const [vendors, setVendors] = useState<UserType[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const locations = ["DACyTI", "DAIA", "DACB", "Externo"]

  useEffect(() => {
    if (selectedLocation) {
      fetchVendors()
      setSelectedVendor(null) // Reset selected vendor when location changes
    }
  }, [selectedLocation])

  useEffect(() => {
    if (selectedVendor) {
      fetchVendorProducts()
    }
  }, [selectedVendor])

  const fetchVendors = async () => {
    setLoading(true)
    const data = await userService.getByLocation(selectedLocation)
    setVendors(data)
    setLoading(false)
  }

  const fetchVendorProducts = async () => {
    if (!selectedVendor) return
    setLoading(true)
    const data = await productService.getByUserId(selectedVendor.id)
    setProducts(data)
    setLoading(false)
  }

  const handleVendorSelect = (vendor: UserType) => {
    setSelectedVendor(vendor)
  }

  const handleBackToVendors = () => {
    setSelectedVendor(null)
    setProducts([])
  }

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location)
    setSelectedVendor(null)
    setProducts([])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            {selectedVendor && (
              <Button onClick={handleBackToVendors} variant="ghost" className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a vendedores
              </Button>
            )}
          </div>
          <h1 className="text-6xl font-bold text-gray-800 tracking-wide">
            JUCHI<span className="text-orange-500">FOOD</span>
          </h1>
          <div className="flex-1 flex justify-end">
            <Button
              onClick={onAuthClick}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full shadow-lg"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>
          </div>
        </div>

        {!selectedVendor && <h2 className="text-4xl font-bold text-gray-700 mb-8">BIENVENIDO</h2>}

        {selectedVendor && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-700 mb-2">{selectedVendor.name}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{selectedVendor.description}</p>
            <div className="flex items-center justify-center mt-2 text-orange-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="font-medium">{selectedVendor.location}</span>
            </div>
          </div>
        )}

        {/* Location Selector - Only show when no vendor is selected */}
        {!selectedVendor && (
          <div className="max-w-md mx-auto mb-8">
            <Select onValueChange={handleLocationChange}>
              <SelectTrigger className="w-full h-12 text-lg border-2 border-orange-200 focus:border-orange-500 rounded-xl">
                <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                <SelectValue placeholder="Selecciona un lugar" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location} className="text-lg py-3">
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Vendors Grid - Show when location is selected but no vendor */}
      {selectedLocation && !selectedVendor && (
        <div>
          <h3 className="text-2xl font-bold text-gray-700 mb-6 text-center">
            Vendedores disponibles en {selectedLocation}
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Cargando vendedores...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <Card
                  key={vendor.id}
                  className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => handleVendorSelect(vendor)}
                >
                  <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white pb-4">
                    <CardTitle className="flex items-center text-xl font-bold">
                      <User className="w-5 h-5 mr-2" />
                      {vendor.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardDescription className="text-gray-700 text-base leading-relaxed mb-4">
                      {vendor.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-orange-600 font-medium">
                        <MapPin className="w-4 h-4 mr-1" />
                        {vendor.location}
                      </div>
                      <Button
                        size="sm"
                        className="bg-gray-700 hover:bg-gray-800 text-white group-hover:bg-orange-500 group-hover:text-white transition-colors"
                      >
                        Ver productos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && vendors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay vendedores disponibles en esta ubicación</p>
            </div>
          )}
        </div>
      )}

      {/* Products Grid - Show when vendor is selected */}
      {selectedVendor && (
        <div>
          <h3 className="text-2xl font-bold text-gray-700 mb-6 text-center flex items-center justify-center">
            <Package className="w-6 h-6 mr-2 text-orange-500" />
            Productos disponibles
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Cargando productos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.image_url || "/placeholder.svg?height=200&width=300&query=comida+mexicana"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      ${product.price.toFixed(2)}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{product.name}</CardTitle>

                    <CardDescription className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {product.description}
                    </CardDescription>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-gray-500">Precio:</span>
                      <span className="text-lg font-bold text-orange-500">${product.price.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto shadow-lg">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No hay productos disponibles</p>
                <p className="text-gray-400 text-sm">Este vendedor aún no ha agregado productos a su menú</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
