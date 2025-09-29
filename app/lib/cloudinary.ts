// Client-side Cloudinary utilities
export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const result = await response.json()
    return result.url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image')
  }
}

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const response = await fetch('/api/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    })

    if (!response.ok) {
      throw new Error('Delete failed')
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete image')
  }
}