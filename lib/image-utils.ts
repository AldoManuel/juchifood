// Utilidades para manejo de imágenes
export const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo la proporción
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

      // Dibujar y comprimir la imagen
      ctx.drawImage(img, 0, 0, width, height)
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
      resolve(compressedDataUrl)
    }

    img.src = URL.createObjectURL(file)
  })
}

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Validar tipo de archivo
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Formato no válido. Solo se permiten archivos JPG, PNG o WebP.",
    }
  }

  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "El archivo es demasiado grande. Máximo 5MB permitido.",
    }
  }

  return { isValid: true }
}

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.src = URL.createObjectURL(file)
  })
}
