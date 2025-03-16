"use client"

import { useState, useRef } from "react"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../Firebase/firebase"
import { uploadToCloudinary } from "../ImagesData/cloudinary"

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoURL, setPhotoURL] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleImageSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview the image
    const reader = new FileReader()
    reader.onload = (e) => {
      setProfilePhoto(e.target.result)
    }
    reader.readAsDataURL(file)

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
      setError("Failed to upload profile image. Please try again.")
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isLogin) {
        // Login with email and password
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        // Create account with name, email, and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        // Update the user's profile with their name and photo
        await updateProfile(userCredential.user, {
          displayName: name,
          photoURL: photoURL || null,
        })

        // Create user document in Firestore for status
        await setDoc(doc(db, "status", userCredential.user.uid), {
          displayName: name,
          email: email,
          photoURL: photoURL || null,
          state: "online",
          lastChanged: new Date(),
        })

        // Create user document in users collection
        await setDoc(doc(db, "users", userCredential.user.uid), {
          displayName: name,
          email: email,
          photoURL: photoURL || null,
          createdAt: new Date(),
        })

        // Create the recentChats collection for the user
        // We don't need a placeholder document anymore, as we'll properly initialize
        // the collection when the first message is sent or received
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6">
      <div className="w-full max-w-md p-4 sm:p-8 space-y-6 sm:space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-600">Chat App</h1>
          <p className="mt-2 text-gray-600">{isLogin ? "Sign in to your account" : "Create a new account"}</p>
        </div>

        {error && <div className="p-3 text-sm text-white bg-red-500 rounded">{error}</div>}

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {/* Name field - only shown when creating account */}
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="User Name"
              />
            </div>
          )}

          {/* Profile photo - only shown when creating account */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Photo (Optional)</label>
              <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <img
                    src={profilePhoto || "/placeholder.svg?height=64&width=64"}
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
                    className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none w-full sm:w-auto"
                  >
                    {isUploading ? "Uploading..." : "Choose Photo"}
                  </button>
                </div>
              </div>
              {isUploading && (
                <div className="mt-2 w-full">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Uploading: {Math.round(uploadProgress)}%</p>
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={isLogin ? "Enter your password" : "Create a strong password"}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isUploading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="w-5 h-5 mr-2 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>{isLogin ? "Sign in" : "Create account"}</>
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError("")
              setProfilePhoto(null)
              setPhotoURL("")
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  )
}

