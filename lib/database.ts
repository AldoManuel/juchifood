import { supabase } from "./supabase"
import { deleteProfileImage, deleteProductImage } from "./storage"
import type { Database } from "./supabase"

type User = Database["public"]["Tables"]["users"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"]
type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"]

// CRUD para Usuarios
export const userService = {
  // Crear usuario
  async create(userData: Omit<UserInsert, "id" | "created_at">): Promise<User | null> {
    const { data, error } = await supabase.from("users").insert(userData).select().single()

    if (error) {
      console.error("Error creating user:", error)
      return null
    }
    return data
  },

  // Obtener usuario por email
  async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error) {
      console.error("Error getting user:", error)
      return null
    }
    return data
  },

  // Obtener usuarios por ubicación
  async getByLocation(location: string): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("location", location)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting users by location:", error)
      return []
    }
    return data || []
  },

  // Obtener todos los usuarios
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting all users:", error)
      return []
    }
    return data || []
  },

  // Actualizar usuario
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    // Si se está actualizando la imagen de perfil y hay una imagen anterior, eliminarla
    if (updates.profile_image) {
      const { data: currentUser } = await supabase.from("users").select("profile_image").eq("id", id).single()

      if (currentUser?.profile_image && currentUser.profile_image !== updates.profile_image) {
        await deleteProfileImage(currentUser.profile_image)
      }
    }

    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating user:", error)
      return null
    }
    return data
  },

  // Eliminar usuario
  async delete(id: string): Promise<boolean> {
    // Primero obtener la imagen de perfil para eliminarla
    const { data: user } = await supabase.from("users").select("profile_image").eq("id", id).single()

    if (user?.profile_image) {
      await deleteProfileImage(user.profile_image)
    }

    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      console.error("Error deleting user:", error)
      return false
    }
    return true
  },

  // Obtener usuario actual (simulado - en una app real usarías sesiones)
  async getCurrentUser(): Promise<User | null> {
    // Por ahora retornamos null, en una app real verificarías la sesión
    return null
  },
}

// CRUD para Productos
export const productService = {
  // Crear producto
  async create(productData: Omit<ProductInsert, "id" | "created_at">): Promise<Product | null> {
    const { data, error } = await supabase.from("products").insert(productData).select().single()

    if (error) {
      console.error("Error creating product:", error)
      return null
    }
    return data
  },

  // Obtener productos por usuario
  async getByUserId(userId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting products by user:", error)
      return []
    }
    return data || []
  },

  // Obtener productos por ubicación (con información del usuario)
  async getByLocation(location: string): Promise<(Product & { user: User })[]> {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        users!inner(*)
      `)
      .eq("users.location", location)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting products by location:", error)
      return []
    }

    // Transformar los datos para que coincidan con el tipo esperado
    return (data || []).map((item) => ({
      ...item,
      user: item.users,
    }))
  },

  // Obtener todos los productos
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting all products:", error)
      return []
    }
    return data || []
  },

  // Actualizar producto
  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    // Si se está actualizando la imagen del producto y hay una imagen anterior, eliminarla
    if (updates.image_url) {
      const { data: currentProduct } = await supabase.from("products").select("image_url").eq("id", id).single()

      if (currentProduct?.image_url && currentProduct.image_url !== updates.image_url) {
        await deleteProductImage(currentProduct.image_url)
      }
    }

    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating product:", error)
      return null
    }
    return data
  },

  // Eliminar producto
  async delete(id: string): Promise<boolean> {
    // Primero obtener la imagen del producto para eliminarla
    const { data: product } = await supabase.from("products").select("image_url").eq("id", id).single()

    if (product?.image_url) {
      await deleteProductImage(product.image_url)
    }

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      return false
    }
    return true
  },
}

// Función de autenticación simple
export const authService = {
  async login(email: string, password: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single()

    if (error) {
      console.error("Error during login:", error)
      return null
    }
    return data
  },
}
