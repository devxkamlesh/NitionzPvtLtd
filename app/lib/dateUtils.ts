export const formatDate = (date: any): string => {
  if (!date) return 'N/A'
  
  try {
    let dateObj: Date
    
    // Handle Firestore Timestamp
    if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate()
    }
    // Handle Firestore Timestamp with seconds
    else if (date && typeof date.seconds === 'number') {
      dateObj = new Date(date.seconds * 1000)
    }
    // Handle ISO string
    else if (typeof date === 'string') {
      dateObj = new Date(date)
    }
    // Handle Date object
    else if (date instanceof Date) {
      dateObj = date
    }
    // Handle timestamp number
    else if (typeof date === 'number') {
      dateObj = new Date(date)
    }
    else {
      return 'Invalid Date'
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }
    
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

export const formatDateTime = (date: any): string => {
  if (!date) return 'N/A'
  
  try {
    let dateObj: Date
    
    // Handle Firestore Timestamp
    if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate()
    }
    // Handle Firestore Timestamp with seconds
    else if (date && typeof date.seconds === 'number') {
      dateObj = new Date(date.seconds * 1000)
    }
    // Handle ISO string
    else if (typeof date === 'string') {
      dateObj = new Date(date)
    }
    // Handle Date object
    else if (date instanceof Date) {
      dateObj = date
    }
    // Handle timestamp number
    else if (typeof date === 'number') {
      dateObj = new Date(date)
    }
    else {
      return 'Invalid Date'
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }
    
    return dateObj.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return 'Invalid Date'
  }
}

export const formatRelativeTime = (date: any): string => {
  if (!date) return 'N/A'
  
  try {
    let dateObj: Date
    
    // Handle Firestore Timestamp
    if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate()
    }
    // Handle Firestore Timestamp with seconds
    else if (date && typeof date.seconds === 'number') {
      dateObj = new Date(date.seconds * 1000)
    }
    // Handle ISO string
    else if (typeof date === 'string') {
      dateObj = new Date(date)
    }
    // Handle Date object
    else if (date instanceof Date) {
      dateObj = date
    }
    // Handle timestamp number
    else if (typeof date === 'number') {
      dateObj = new Date(date)
    }
    else {
      return 'Invalid Date'
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }
    
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else {
      return formatDate(dateObj)
    }
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return 'Invalid Date'
  }
}