"use client"

import { useState, useRef } from "react"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../Firebase/firebase"
import { uploadToCloudinary } from "../ImagesData/cloudinary"

export default function ProfileUpdate({ user, onClose, theme }) {
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setIsUploading(true)
      setUploadProgress(10)

      // Simulate progress (since Cloudinary doesn't provide progress events in this implementation)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file)

      clearInterval(progressInterval)
      setUploadProgress(100)
      setPhotoURL(result.url)
      setIsUploading(false)
    } catch (error) {
      console.error("Error uploading image:", error)
      setError("Failed to upload image. Please try again.")
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName,
        photoURL,
      })

      // Update Firestore status document
      await updateDoc(doc(db, "status", user.uid), {
        displayName,
        photoURL,
      })

      // Update Firestore user document
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        photoURL,
      })

      setSuccess(true)

      // Close modal after a short delay
      setTimeout(() => {
        if (onClose) onClose()
      }, 1500)
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile. Please try again.")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className={`w-full max-w-md p-4 sm:p-6 rounded-lg shadow-lg ${theme === "light" ? "bg-white" : "bg-[#1E2A47]"}`}
      >
        <h2 className={`text-xl font-semibold mb-4 ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}>
          Update Profile
        </h2>

        {error && <div className="p-3 mb-4 text-sm text-white bg-red-500 rounded">{error}</div>}
        {success && (
          <div className="p-3 mb-4 text-sm text-white bg-green-500 rounded">Profile updated successfully!</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="displayName"
              className={`block text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border ${
                theme === "light"
                  ? "border-gray-300 bg-white text-gray-900"
                  : "border-gray-600 bg-[#2B3B5E] text-gray-100"
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Your name"
            />
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
              Profile Photo
            </label>
            <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <img
                  src={photoURL || "/placeholder.svg?height=64&width=64"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={isUploading}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    theme === "light"
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-[#2B3B5E] text-gray-200 hover:bg-[#3B4B6E]"
                  } focus:outline-none`}
                >
                  {isUploading ? "Uploading..." : "Change Photo"}
                </button>
              </div>
            </div>
            {isUploading && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Uploading: {Math.round(uploadProgress)}%</p>
              </div>
            )}
          </div>

          <div className="flex n flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium rounded-md w-full ${
                theme === "light"
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-[#2B3B5E] text-gray-200 hover:bg-[#3B4B6E]"
              } focus:outline-none`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 w-full"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

