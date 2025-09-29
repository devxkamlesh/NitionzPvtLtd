'use client'

import { useState } from 'react'
import { useAuth } from './FirebaseProvider'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { MessageSquare, X, Send, Star } from 'lucide-react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { user } = useAuth()
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim() || !user) return

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Anonymous',
        feedback: feedback.trim(),
        rating,
        category,
        status: 'new',
        createdAt: serverTimestamp()
      })

      setFeedback('')
      setRating(0)
      setCategory('general')
      onClose()
      alert('Thank you for your feedback! We appreciate your input.')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Share Your Feedback</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="ui">User Interface</option>
                <option value="performance">Performance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (Optional)
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what you think about our platform..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Beta Version:</strong> Your feedback helps us improve the platform. 
                Thank you for being part of our beta testing community!
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !feedback.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}