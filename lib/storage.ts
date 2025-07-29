import { supabase } from "./supabase"

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

// Función para generar nombre único de archivo
const generateFileName = (originalName: string, prefix = ""): string => {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split(".").pop()
  return `${prefix}${timestamp}-${randomId}.${extension}`
}

// Subir imagen de perfil
export const uploadProfileImage = async (file: File, userId: string): Promise<UploadResult> => {
  try {
    // Validar archivo
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "El archivo debe ser una imagen" }
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      return { success: false, error: "El archivo no puede ser mayor a 5MB" }
    }

    // Generar nombre único
    const fileName = generateFileName(file.name, `profile-${userId}-`)

    // Subir archivo
    const { data, error } = await supabase.storage.from("profile-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading profile image:", error)
      return { success: false, error: "Error al subir la imagen" }
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage.from("profile-images").getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Error in uploadProfileImage:", error)
    return { success: false, error: "Error inesperado al subir la imagen" }
  }
}

// Subir imagen de producto
export const uploadProductImage = async (file: File, userId: string): Promise<UploadResult> => {
  try {
    // Validar archivo
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "El archivo debe ser una imagen" }
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      return { success: false, error: "El archivo no puede ser mayor a 5MB" }
    }

    // Generar nombre único
    const fileName = generateFileName(file.name, `product-${userId}-`)

    // Subir archivo
    const { data, error } = await supabase.storage.from("product-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading product image:", error)
      return { success: false, error: "Error al subir la imagen" }
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Error in uploadProductImage:", error)
    return { success: false, error: "Error inesperado al subir la imagen" }
  }
}

// Eliminar imagen de perfil
export const deleteProfileImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extraer el path de la URL
    const urlParts = imageUrl.split("/profile-images/")
    if (urlParts.length !== 2) return false

    const filePath = urlParts[1]

    const { error } = await supabase.storage.from("profile-images").remove([filePath])

    if (error) {
      console.error("Error deleting profile image:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteProfileImage:", error)
    return false
  }
}

// Eliminar imagen de producto
export const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extraer el path de la URL
    const urlParts = imageUrl.split("/product-images/")
    if (urlParts.length !== 2) return false

    const filePath = urlParts[1]

    const { error } = await supabase.storage.from("product-images").remove([filePath])

    if (error) {
      console.error("Error deleting product image:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteProductImage:", error)
    return false
  }
}

// Función para comprimir imagen antes de subir (opcional)
export const compressImageFile = (file: File, maxWidth = 800, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()

    img.onload = () => {
      // Calcular nuevas dimensiones
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxWidth) {
          width = (width * maxWidth) / height
          height = maxWidth
        }
      }

      canvas.width = width
      canvas.height = height

      // Dibujar imagen
      ctx.drawImage(img, 0, 0, width, height)

      // Convertir a blob y luego a File
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file) // Si falla la compresión, devolver archivo original
          }
        },
        "image/jpeg",
        quality,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}
