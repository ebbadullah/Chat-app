"use client"

import { useState, useEffect, useRef } from "react"
import { Phone, Video, MoreVertical, Image, Paperclip, Send, Smile, Trash2, Search, ChevronLeft, X } from "lucide-react"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  deleteDoc,
  arrayUnion,
  where,
  getDocs,
} from "firebase/firestore"
import { db } from "../Firebase/firebase"
import { uploadToCloudinary } from "../ImagesData/cloudinary"
import AppSidebar from "./Sidebar"
import AppNavbar from "./Navbar"
import ProfileUpdate from "../Components/ProfileUpdate"
import MessageContextMenu from "../Components/MessageContextMenu"
import MobileNavigation from "../Components/MobileNavigation"
import MobileSidebar from "../Components/MobileSidebar"

// Add this CSS class for hiding scrollbars
const hideScrollbarClass = "scrollbar-hide"

export default function ChatApp({ user, onSignOut }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState("light")
  const [showMediaFiles, setShowMediaFiles] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showProfileUpdate, setShowProfileUpdate] = useState(false)
  const [chatListOpen, setChatListOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // State for search and recent chats
  const [allUsers, setAllUsers] = useState([])
  const [recentChats, setRecentChats] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Add a new state variable for tracking unread messages after the other state declarations
  const [unreadCounts, setUnreadCounts] = useState({})

  // Context menu Hai Msg delete karne ke liyeh 
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    messageId: null,
    isRead: false,
  })

  // Add a new state variable
  const [expandedNavbar, setExpandedNavbar] = useState(false)

  //mobile per dekhne ke liyeh alg state variable lagai hai
  const [mobileView, setMobileView] = useState("list") // "list" or "chat"

  // Ye Scroll Barr  ke liyeh hai  
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Ensure the expanded navbar appears below the header */
.mobile-expanded-navbar {
  top: 3.5rem !important; /* 14px (top bar height) */
  z-index: 25 !important;
}

/* Add responsive utilities for very small screens */
@media (min-width: 400px) {
  .xs\\:block {
    display: block;
  }
}

@media (max-width: 399px) {
  .xs\\:block {
    display: none;
  }
}

/* Fixed chat layout */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.chat-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: inherit;
}

.chat-messages {
  position: absolute;
  top: 70px; /* Adjust based on your header height */
  bottom: 70px; /* Adjust based on your input height */
  left: 0;
  right: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
}

.chat-input {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: inherit;
}

/* Mobile chat list */
.mobile-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.mobile-chat-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: inherit;
}

.mobile-chat-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
`
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Initialize sidebar state
  useEffect(() => {
    // Initialize sidebar as closed on mobile, open on desktop
    const isMobile = window.innerWidth < 768
    setSidebarOpen(!isMobile)
    window.sidebarLocked = !isMobile

    // Set initial mobile view based on whether a user is selected
    if (isMobile) {
      setMobileView(selectedUser ? "chat" : "list")
    }

    // Add resize listener to handle screen size changes
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [selectedUser])

  // Set up user presence
  useEffect(() => {
    if (!user) return

    // Set user as online
    const userStatusRef = doc(db, "status", user.uid)
    const setUserOnline = async () => {
      await setDoc(userStatusRef, {
        state: "online",
        lastChanged: serverTimestamp(),
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || null,
        email: user.email,
      })
    }

    // Set user as offline when they disconnect
    const setUserOffline = async () => {
      await setDoc(userStatusRef, {
        state: "offline",
        lastChanged: serverTimestamp(),
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || null,
        email: user.email,
      })
    }

    setUserOnline()

    // Set up event listeners for online/offline status
    window.addEventListener("beforeunload", setUserOffline)
    window.addEventListener("online", setUserOnline)
    window.addEventListener("offline", setUserOffline)

    return () => {
      setUserOffline()
      window.removeEventListener("beforeunload", setUserOffline)
      window.removeEventListener("online", setUserOnline)
      window.removeEventListener("offline", setUserOffline)
    }
  }, [user])

  // Fetch all users for search functionality
  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "status"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          lastSeen: doc.data().state === "online" ? "Online" : "Offline",
        }))
        .filter((chatUser) => chatUser.id !== user.uid) // Filter out current user

      setAllUsers(users)
    })

    return () => unsubscribe()
  }, [user])

  // Fetch user's recent chats
  useEffect(() => {
    if (!user) return

    const recentChatsRef = collection(db, "users", user.uid, "recentChats")
    const q = query(recentChatsRef, orderBy("timestamp", "desc"))

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setRecentChats([])
        return
      }

      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lastSeen: "Unknown", // Will be updated below
      }))

      // Get online status for each chat
      const statusPromises = chats.map(async (chat) => {
        const statusDoc = await getDoc(doc(db, "status", chat.id))
        if (statusDoc.exists()) {
          return {
            ...chat,
            state: statusDoc.data().state,
            photoURL: statusDoc.data().photoURL || chat.photoURL || null, // Ensure photoURL is included
            lastSeen: statusDoc.data().state === "online" ? "Online" : "Offline",
          }
        }
        return chat
      })

      const updatedChats = await Promise.all(statusPromises)
      setRecentChats(updatedChats)

      // Set first chat as selected if no user is selected
      if (updatedChats.length > 0 && !selectedUser) {
        setSelectedUser(updatedChats[0])
      }
    })

    return () => unsubscribe()
  }, [user, selectedUser])

  // Fetch messages when selected user changes
  useEffect(() => {
    if (!user || !selectedUser) return

    // Create a unique chat ID (combination of both user IDs, sorted alphabetically)
    const chatId = [user.uid, selectedUser.id].sort().join("_")

    // Query messages for this chat
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }))

      // Filter out messages deleted for the current user
      const filteredMessages = fetchedMessages.filter((msg) => {
        return !msg.deletedFor || !msg.deletedFor.includes(user.uid)
      })

      setMessages(filteredMessages)

      // Mark messages as read
      snapshot.docs.forEach(async (doc) => {
        if (doc.data().sender !== user.uid && !doc.data().read) {
          await updateDoc(doc.ref, { read: true })
        }
      })

      // Reset unread count for this chat
      if (selectedUser) {
        const chatRef = doc(db, "users", user.uid, "recentChats", selectedUser.id)
        updateDoc(chatRef, { unreadCount: 0 }).catch((err) => console.error("Error resetting unread count:", err))

        // Also update local state
        setUnreadCounts((prev) => {
          const updated = { ...prev }
          delete updated[selectedUser.id]
          return updated
        })
      }
    })

    return () => unsubscribe()
  }, [user, selectedUser])

  // Track unread messages for each chat
  useEffect(() => {
    if (!user) return

    // Listen for unread messages across all chats
    const unsubscribe = onSnapshot(collection(db, "users", user.uid, "recentChats"), (snapshot) => {
      const counts = {}

      snapshot.docs.forEach((doc) => {
        const chatData = doc.data()
        if (chatData.unreadCount && chatData.unreadCount > 0) {
          counts[doc.id] = chatData.unreadCount
        }
      })

      setUnreadCounts(counts)
    })

    return () => unsubscribe()
  }, [user])

  // Listen for new messages from all chats
  useEffect(() => {
    if (!user) return

    // Create a listener for all chats the user is part of
    const chatsQuery = query(collection(db, "users", user.uid, "recentChats"))

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      // For each chat, check if there are new messages
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added" || change.type === "modified") {
          const chatData = change.doc.data()

          // If this chat is not currently selected and has unread messages
          if ((!selectedUser || selectedUser.id !== change.doc.id) && chatData.unreadCount > 0) {
            // Play notification sound (optional)
            const audio = new Audio("/notification.mp3")
            audio.play().catch((e) => console.log("Audio play prevented:", e))

            // You could also show a browser notification here
            if (Notification.permission === "granted") {
              new Notification(`New message from ${chatData.displayName || chatData.email}`, {
                body: chatData.lastMessage || "New message",
                icon: chatData.photoURL || "/placeholder.svg?height=64&width=64",
              })
            }
          }
        }
      })
    })

    return () => unsubscribe()
  }, [user, selectedUser])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Toggle sidebar function
  const toggleSidebar = () => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      // On mobile, just toggle the sidebar visibility
      setSidebarOpen(!sidebarOpen)
    } else {
      // On desktop, toggle the locked state and visibility
      window.sidebarLocked = !window.sidebarLocked
      setSidebarOpen(!sidebarOpen)
    }
  }

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (newMessage.trim() === "" && !isUploading) return
    if (!selectedUser) return

    try {
      // Create a unique chat ID (combination of both user IDs, sorted alphabetically)
      const chatId = [user.uid, selectedUser.id].sort().join("_")

      // Add message to Firestore
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: newMessage.trim(),
        sender: user.uid,
        receiver: selectedUser.id,
        timestamp: serverTimestamp(),
        read: false,
        type: "text",
        deletedFor: [], // Track which users have deleted this message
      })

      // Update sender's recent chats
      const userRef = doc(db, "users", user.uid, "recentChats", selectedUser.id)
      await setDoc(
        userRef,
        {
          id: selectedUser.id,
          displayName: selectedUser.displayName || selectedUser.email,
          photoURL: selectedUser.photoURL || null,
          email: selectedUser.email,
          lastMessage: newMessage.trim(),
          timestamp: serverTimestamp(),
          // No unread count for sender's own messages
        },
        { merge: true },
      )

      // Update recipient's recent chats with unread count
      const otherUserRef = doc(db, "users", selectedUser.id, "recentChats", user.uid)
      const otherUserChat = await getDoc(otherUserRef)
      const currentUnreadCount = otherUserChat.exists() ? otherUserChat.data().unreadCount || 0 : 0

      await setDoc(
        otherUserRef,
        {
          id: user.uid,
          displayName: user.displayName || user.email,
          photoURL: user.photoURL || null,
          email: user.email,
          lastMessage: newMessage.trim(),
          timestamp: serverTimestamp(),
          unreadCount: currentUnreadCount + 1,
        },
        { merge: true },
      )

      // Clear input
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Handle image upload using Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedUser) return

    try {
      setIsUploading(true)
      setUploadProgress(10)

      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        throw new Error("File size exceeds 10MB limit. Please choose a smaller image.")
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(file.type)) {
        throw new Error("Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.")
      }

      // Simulate progress
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
      let result
      try {
        result = await uploadToCloudinary(file)
      } catch (uploadError) {
        clearInterval(progressInterval)
        console.error("Cloudinary upload error:", uploadError)
        throw new Error(`Failed to upload image: ${uploadError.message || "Unknown error"}`)
      }

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Create a unique chat ID
      const chatId = [user.uid, selectedUser.id].sort().join("_")

      // Add message to Firestore
      await addDoc(collection(db, "chats", chatId, "messages"), {
        sender: user.uid,
        receiver: selectedUser.id,
        timestamp: serverTimestamp(),
        read: false,
        type: "image",
        url: result.url,
        publicId: result.publicId,
        deletedFor: [],
      })

      // Update sender's recent chats
      const userRef = doc(db, "users", user.uid, "recentChats", selectedUser.id)
      await setDoc(
        userRef,
        {
          id: selectedUser.id,
          displayName: selectedUser.displayName || selectedUser.email,
          photoURL: selectedUser.photoURL || null,
          email: selectedUser.email,
          lastMessage: "Sent an image",
          timestamp: serverTimestamp(),
        },
        { merge: true },
      )

      // Update recipient's recent chats with unread count
      const otherUserRef = doc(db, "users", selectedUser.id, "recentChats", user.uid)
      const otherUserChat = await getDoc(otherUserRef)
      const currentUnreadCount = otherUserChat.exists() ? otherUserChat.data().unreadCount || 0 : 0

      await setDoc(
        otherUserRef,
        {
          id: user.uid,
          displayName: user.displayName || user.email,
          photoURL: user.photoURL || null,
          email: user.email,
          lastMessage: "Sent an image",
          timestamp: serverTimestamp(),
          unreadCount: currentUnreadCount + 1,
        },
        { merge: true },
      )

      setIsUploading(false)
      setUploadProgress(0)
    } catch (error) {
      console.error("Error handling image upload:", error)
      alert(`Upload failed: ${error.message || "Unknown error"}`)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Handle searching for users
  const handleSearch = (query) => {
    setSearchQuery(query)

    if (query.trim() === "") {
      setIsSearching(false)
      setSearchResults([])
      return
    }

    setIsSearching(true)

    // Filter all users based on search query
    const results = allUsers.filter(
      (user) =>
        user.displayName?.toLowerCase().includes(query.toLowerCase()) ||
        user.email?.toLowerCase().includes(query.toLowerCase()),
    )

    setSearchResults(results)
  }

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Handle message context menu
  const handleMessageContextMenu = (e, message) => {
    e.preventDefault()

    // Only allow context menu on user's own messages
    if (message.sender !== user.uid) return

    // Calculate position, ensuring menu stays within viewport
    const x = Math.min(e.clientX, window.innerWidth - 200)
    const y = Math.min(e.clientY, window.innerHeight - 150)

    setContextMenu({
      isOpen: true,
      position: { x, y },
      messageId: message.id,
      isRead: message.read,
    })
  }

  // Handle delete for me
  const handleDeleteForMe = async () => {
    if (!contextMenu.messageId || !selectedUser) return

    try {
      const chatId = [user.uid, selectedUser.id].sort().join("_")
      const messageRef = doc(db, "chats", chatId, "messages", contextMenu.messageId)

      // Update the message to mark it as deleted for this user
      await updateDoc(messageRef, {
        deletedFor: arrayUnion(user.uid),
      })

      // Remove the message from the local state
      setMessages(messages.filter((msg) => msg.id !== contextMenu.messageId))
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  // Handle delete for everyone
  const handleDeleteForEveryone = async () => {
    if (!contextMenu.messageId || !selectedUser) return

    try {
      const chatId = [user.uid, selectedUser.id].sort().join("_")
      const messageRef = doc(db, "chats", chatId, "messages", contextMenu.messageId)

      // Delete the message completely
      await deleteDoc(messageRef)

      // Update the last message in recent chats if this was the last message
      const lastMessageQuery = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("timestamp", "desc"),
        where("deletedFor", "array-contains-any", []),
      )

      const lastMessageSnapshot = await getDocs(lastMessageQuery)

      if (!lastMessageSnapshot.empty) {
        const lastMessage = lastMessageSnapshot.docs[0].data()

        // Update sender's recent chats
        await updateDoc(doc(db, "users", user.uid, "recentChats", selectedUser.id), {
          lastMessage: lastMessage.type === "text" ? lastMessage.text : "Sent an image",
        })

        // Update receiver's recent chats
        await updateDoc(doc(db, "users", selectedUser.id, "recentChats", user.uid), {
          lastMessage: lastMessage.type === "text" ? lastMessage.text : "Sent an image",
        })
      }

      // Remove the message from the local state
      setMessages(messages.filter((msg) => msg.id !== contextMenu.messageId))
    } catch (error) {
      console.error("Error deleting message for everyone:", error)
    }
  }

  // Modify the setSelectedUser function to also update the mobile view
  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setMobileView("chat")
    setChatListOpen(false)
  }

  // Add a function to go back to the chat list
  const goBackToList = () => {
    setMobileView("list")
  }

  // Handle sign out with proper redirection
  const handleSignOut = async () => {
    try {
      // Import auth from Firebase
      const { auth } = await import("../Firebase/firebase")

      // Set user as offline before signing out
      if (user) {
        const userStatusRef = doc(db, "status", user.uid)
        await setDoc(userStatusRef, {
          state: "offline",
          lastChanged: serverTimestamp(),
          displayName: user.displayName || user.email,
          photoURL: user.photoURL || null,
          email: user.email,
        })
      }

      // Sign out from Firebase
      await auth.signOut()

      // Redirect to the login page (root path)
      window.location.href = "/"

      // Call the original onSignOut if it exists (for compatibility)
      if (onSignOut) {
        onSignOut()
      }
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className={`flex flex-col h-screen ${theme === "light" ? "bg-gray-100" : "bg-[#171F2F]"}`}>
      {/* Mobile Navigation */}
      <MobileNavigation
        user={user}
        theme={theme}
        onSignOut={handleSignOut}
        onProfileClick={() => setShowProfileUpdate(true)}
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        setTheme={setTheme}
        setExpandedNavbarState={(state) => setExpandedNavbar(state)}
        mobileView={mobileView}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar theme={theme} open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Mobile Chat List */}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar open={sidebarOpen} setOpen={setSidebarOpen} theme={theme} />
      </div>

      <div className={`flex flex-col flex-1 ${sidebarOpen ? "md:ml-64" : "md:ml-20"} transition-all duration-300`}>
        {/* Desktop Navbar */}
        <div className="hidden md:block">
          <AppNavbar
            user={user}
            onSignOut={handleSignOut}
            setSidebarOpen={setSidebarOpen}
            sidebarOpen={sidebarOpen}
            theme={theme}
            setTheme={toggleTheme}
            onProfileClick={() => setShowProfileUpdate(true)}
          />
        </div>

        <div
          className={`flex flex-col md:flex-row flex-1 overflow-hidden ${theme === "light" ? "bg-white" : "bg-[#1E2A47]"} md:rounded-tl-xl mt-14 md:mt-20 shadow-lg transition-all duration-300`}
        >
          {/* Chat users list - Desktop */}
          <div
            className={`w-full md:w-80 ${theme === "light" ? "border-gray-200" : "border-gray-700/50"} md:border-r hidden md:flex md:flex-col h-full`}
          >
            <div className="p-8 flex-shrink-0">
              <div className="flex items-center justify-between mb-6 relative">
                <h1 className={`text-xl font-semibold ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}>
                  Chat
                </h1>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`${theme === "light" ? "text-gray-600 hover:text-gray-800" : "text-gray-400 hover:text-gray-200"}`}
                >
                  <MoreVertical size={20} />
                </button>

                {showSettings && (
                  <div
                    className={`absolute right-0 top-8 w-48 rounded-md shadow-lg ${theme === "light" ? "bg-white" : "bg-[#2B3B5E]"} ring-1 ring-black ring-opacity-5 z-20`}
                  >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button
                        onClick={() => {
                          setShowProfileUpdate(true)
                          setShowSettings(false)
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"}`}
                        role="menuitem"
                      >
                        Profile
                      </button>
                      <a
                        href="#"
                        className={`block px-4 py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"}`}
                        role="menuitem"
                      >
                        Settings
                      </a>
                      <button
                        onClick={handleSignOut}
                        className={`block w-full text-left px-4 py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"}`}
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for users..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`w-full ${theme === "light" ? "bg-gray-100 text-gray-800" : "bg-[#2B3B5E]/50 text-gray-200"} placeholder-gray-400 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 scrollbar-hide">
              {isSearching ? (
                <div className="px-3">
                  <div className="flex items-center text-sm text-gray-400 px-3 mb-2">
                    <span>Search Results</span>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((searchUser) => (
                        <div
                          key={searchUser.id}
                          className={`p-3 rounded-lg transition-colors flex items-center cursor-pointer ${
                            theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#2B3B5E]/50"
                          }`}
                          onClick={() => {
                            setSelectedUser(searchUser)
                            setSearchQuery("")
                            setIsSearching(false)
                            setSearchResults([])
                          }}
                        >
                          <div className="relative">
                            <img
                              src={searchUser.photoURL || "/placeholder.svg?height=48&width=48"}
                              alt={searchUser.displayName || searchUser.email}
                              className="w-12 h-12 rounded-full"
                            />
                            {searchUser.state === "online" && (
                              <span
                                className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 ${theme === "light" ? "border-white" : "border-[#1E2A47]"}`}
                              ></span>
                            )}
                          </div>

                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span
                                className={`font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"} truncate`}
                              >
                                {searchUser.displayName || searchUser.email}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-gray-400 truncate">
                                {searchUser.state === "online" ? "Online" : "Offline"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-4 text-center">
                      <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                        No users found
                      </p>
                    </div>
                  )}
                </div>
              ) : recentChats.length > 0 ? (
                <div className="px-3">
                  <div className="flex items-center text-sm text-gray-400 px-3 mb-2">
                    <span>Recent Chats</span>
                  </div>

                  <div className="space-y-1">
                    {recentChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`p-3 cursor-pointer rounded-lg transition-colors flex items-center ${
                          selectedUser?.id === chat.id
                            ? theme === "light"
                              ? "bg-blue-50"
                              : "bg-[#2B3B5E]"
                            : theme === "light"
                              ? "hover:bg-gray-100"
                              : "hover:bg-[#2B3B5E]/50"
                        }`}
                        onClick={() => setSelectedUser(chat)}
                      >
                        <div className="relative">
                          <img
                            src={chat.photoURL || "/placeholder.svg?height=48&width=48"}
                            alt={chat.displayName || chat.email}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {chat.state === "online" && (
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 ${theme === "light" ? "border-white" : "border-[#1E2A47]"}`}
                            ></span>
                          )}
                        </div>

                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span
                              className={`font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"} truncate`}
                            >
                              {chat.displayName || chat.email}
                            </span>
                            <span className="text-xs text-gray-400">
                              {chat.timestamp?.toDate ? formatTime(chat.timestamp.toDate()) : ""}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-400 truncate">
                              {chat.lastMessage || (chat.state === "online" ? "Online" : "Offline")}
                            </p>
                            {unreadCounts[chat.id] > 0 && (
                              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-xs text-white bg-green-500 rounded-full">
                                {unreadCounts[chat.id]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-8 py-4 text-center">
                  <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    No chats yet. Search for users to start chatting.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat area with optional media sidebar */}
          <div className="flex-1 flex relative h-full">
            {/* Mobile Chat List View */}
            {window.innerWidth < 768 && mobileView === "list" ? (
              <div className="w-full h-full flex flex-col mobile-chat-container">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 mobile-chat-header">
                  <h2 className={`text-lg font-semibold ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}>
                    Chats
                  </h2>
                </div>

                <div className="p-4 mobile-chat-header">
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Search for users..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className={`w-full ${theme === "light" ? "bg-gray-100 text-gray-800" : "bg-[#2B3B5E]/50 text-gray-200"} placeholder-gray-400 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="px-4 mobile-chat-list scrollbar-hide">
                  {isSearching ? (
                    <div>
                      <div className="flex items-center text-sm text-gray-400 mb-2">
                        <span>Search Results</span>
                      </div>

                      {searchResults.length > 0 ? (
                        <div className="space-y-1">
                          {searchResults.map((searchUser) => (
                            <div
                              key={searchUser.id}
                              className={`p-3 rounded-lg transition-colors flex items-center cursor-pointer ${
                                theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#2B3B5E]/50"
                              }`}
                              onClick={() => handleSelectUser(searchUser)}
                            >
                              <div className="relative">
                                <img
                                  src={searchUser.photoURL || "/placeholder.svg?height=48&width=48"}
                                  alt={searchUser.displayName || searchUser.email}
                                  className="w-12 h-12 rounded-full"
                                />
                                {searchUser.state === "online" && (
                                  <span
                                    className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 ${theme === "light" ? "border-white" : "border-[#1E2A47]"}`}
                                  ></span>
                                )}
                              </div>

                              <div className="ml-3 flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <span
                                    className={`font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"} truncate`}
                                  >
                                    {searchUser.displayName || searchUser.email}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <p className="text-sm text-gray-400 truncate">
                                    {searchUser.state === "online" ? "Online" : "Offline"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center">
                          <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                            No users found
                          </p>
                        </div>
                      )}
                    </div>
                  ) : recentChats.length > 0 ? (
                    <div>
                      <div className="flex items-center text-sm text-gray-400 mb-2">
                        <span>Recent Chats</span>
                      </div>

                      <div className="space-y-1">
                        {recentChats.map((chat) => (
                          <div
                            key={chat.id}
                            className={`p-3 cursor-pointer rounded-lg transition-colors flex items-center ${
                              selectedUser?.id === chat.id
                                ? theme === "light"
                                  ? "bg-blue-50"
                                  : "bg-[#2B3B5E]"
                                : theme === "light"
                                  ? "hover:bg-gray-100"
                                  : "hover:bg-[#2B3B5E]/50"
                            }`}
                            onClick={() => handleSelectUser(chat)}
                          >
                            <div className="relative">
                              <img
                                src={chat.photoURL || "/placeholder.svg?height=48&width=48"}
                                alt={chat.displayName || chat.email}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              {chat.state === "online" && (
                                <span
                                  className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 ${theme === "light" ? "border-white" : "border-[#1E2A47]"}`}
                                ></span>
                              )}
                            </div>

                            <div className="ml-3 flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span
                                  className={`font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"} truncate`}
                                >
                                  {chat.displayName || chat.email}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {chat.timestamp?.toDate ? formatTime(chat.timestamp.toDate()) : ""}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-400 truncate">
                                  {chat.lastMessage || (chat.state === "online" ? "Online" : "Offline")}
                                </p>
                                {unreadCounts[chat.id] > 0 && (
                                  <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-xs text-white bg-green-500 rounded-full">
                                    {unreadCounts[chat.id]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                        No chats yet. Search for users to start chatting.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Main chat content - shown on desktop or when a chat is selected on mobile */
              <>
                {selectedUser ? (
                  /* Main chat content */
                  <div
                    className={`${showMediaFiles ? "md:w-3/5" : "w-full"} transition-all duration-300 chat-container`}
                    style={{
                      height: "100%",
                      backgroundColor: theme === "light" ? "white" : "#1E2A47",
                    }}
                  >
                    {/* Chat header - fixed */}
                    <div
                      className={`p-2 sm:p-4 flex items-center justify-between ${theme === "light" ? "border-gray-200" : "border-gray-700/50"} border-b chat-header`}
                      style={{
                        backgroundColor: theme === "light" ? "white" : "#1E2A47",
                        height: "70px", // Adjust based on your design
                      }}
                    >
                      <div className="flex items-center min-w-0">
                        {window.innerWidth < 768 && mobileView === "chat" && (
                          <button
                            onClick={goBackToList}
                            className={`mr-2 p-1.5 rounded-lg ${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"} flex-shrink-0`}
                          >
                            <ChevronLeft size={18} />
                          </button>
                        )}
                        <img
                          src={selectedUser.photoURL || "/placeholder.svg?height=40&width=40"}
                          alt={selectedUser.displayName || selectedUser.email}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="ml-2 sm:ml-3 truncate">
                          <div
                            className={`font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"} truncate`}
                          >
                            {selectedUser.displayName || selectedUser.email}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-400">
                            {selectedUser.state === "online" ? "Online" : "Offline"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
                        <button
                          className={`p-1.5 sm:p-2 ${theme === "light" ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" : "text-gray-400 hover:text-gray-200 hover:bg-[#2B3B5E]"} rounded-lg hidden sm:block`}
                        >
                          <Phone size={18} />
                        </button>
                        <button
                          className={`p-1.5 sm:p-2 ${theme === "light" ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" : "text-gray-400 hover:text-gray-200 hover:bg-[#2B3B5E]"} rounded-lg hidden sm:block`}
                        >
                          <Video size={18} />
                        </button>
                        <button
                          onClick={() => setShowMediaFiles(!showMediaFiles)}
                          className={`p-1.5 sm:p-2 ${theme === "light" ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" : "text-gray-400 hover:text-gray-200 hover:bg-[#2B3B5E]"} rounded-lg`}
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Messages - scrollable */}
                    <div
                      className={`${theme === "light" ? "bg-gray-50" : ""} scrollbar-hide chat-messages`}
                      style={{
                        backgroundColor: theme === "light" ? "#f9fafb" : "#1E2A47",
                      }}
                    >
                      {messages.length > 0 ? (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === user.uid ? "justify-end" : "justify-start"} mb-6`}
                            onContextMenu={(e) => handleMessageContextMenu(e, message)}
                          >
                            {message.sender !== user.uid && (
                              <img
                                src={selectedUser.photoURL || "/placeholder.svg?height=32&width=32"}
                                alt={selectedUser.displayName || selectedUser.email}
                                className="w-8 h-8 rounded-full object-cover mr-3 self-end"
                              />
                            )}
                            <div
                              className={`max-w-md relative group ${
                                message.sender === user.uid
                                  ? theme === "light"
                                    ? "bg-blue-600 text-white"
                                    : "bg-[#3B82F6] text-white"
                                  : theme === "light"
                                    ? "bg-gray-200 text-gray-800"
                                    : "bg-[#2B3B5E] text-gray-200"
                              } ${message.sender === user.uid ? "rounded-t-2xl rounded-l-2xl" : "rounded-t-2xl rounded-r-2xl"}`}
                            >
                              {/* Delete button that appears on hover for user's own messages */}
                              {message.sender === user.uid && (
                                <button
                                  onClick={(e) => handleMessageContextMenu(e, message)}
                                  className={`absolute -right-8 top-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                                    theme === "light"
                                      ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                      : "bg-[#2B3B5E] text-gray-400 hover:bg-[#3B4B6E]"
                                  }`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}

                              {message.type === "image" ? (
                                <img
                                  src={message.url || "/placeholder.svg"}
                                  alt="Shared"
                                  className="rounded-lg max-w-xs object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null
                                    e.target.src = "/placeholder.svg?height=200&width=200&text=Image+Error"
                                  }}
                                />
                              ) : (
                                <p className="p-4">{message.text}</p>
                              )}
                              <div
                                className={`px-4 pb-2 flex items-center justify-end space-x-2 ${
                                  message.sender === user.uid
                                    ? theme === "light"
                                      ? "text-blue-200"
                                      : "text-blue-200"
                                    : theme === "light"
                                      ? "text-gray-500"
                                      : "text-gray-400"
                                }`}
                              >
                                <span className="text-xs">{formatTime(message.timestamp)}</span>
                                {message.sender === user.uid && (
                                  <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d={message.read ? "M2 12L7 17L17 7 M7 12L12 17L22 7" : "M2 12L7 17L17 7"}
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                            No messages yet. Start a conversation!
                          </p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message input - fixed */}
                    <div
                      className={`p-2 sm:p-4 ${theme === "light" ? "border-gray-200" : "border-gray-700/50"} border-t chat-input`}
                      style={{
                        backgroundColor: theme === "light" ? "white" : "#1E2A47",
                        height: "70px", // Adjust based on your design
                      }}
                    >
                      {isUploading && (
                        <div className="mb-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Uploading image: {Math.round(uploadProgress)}%</p>
                        </div>
                      )}
                      <form onSubmit={handleSendMessage} className="flex items-center space-x-1">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className={`p-1.5 sm:p-2 ${theme === "light" ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" : "text-gray-400 hover:text-gray-200 hover:bg-[#2B3B5E]"} rounded-lg flex-shrink-0`}
                          disabled={isUploading}
                        >
                          <Image size={18} />
                        </button>
                        <button
                          type="button"
                          className={`p-1.5 sm:p-2 ${theme === "light" ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" : "text-gray-400 hover:text-gray-200 hover:bg-[#2B3B5E]"} rounded-lg flex-shrink-0 hidden xs:block`}
                        >
                          <Paperclip size={18} />
                        </button>
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a Message..."
                          className={`flex-1 min-w-0 ${theme === "light" ? "bg-gray-100 text-gray-800" : "bg-[#2B3B5E]/50 text-gray-200"} placeholder-gray-400 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                        />
                        <button
                          type="button"
                          className={`p-1.5 sm:p-2 ${theme === "light" ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" : "text-gray-400 hover:text-gray-200 hover:bg-[#2B3B5E]"} rounded-lg flex-shrink-0 hidden xs:block`}
                        >
                          <Smile size={18} />
                        </button>
                        <button
                          type="submit"
                          disabled={isUploading || (!newMessage.trim() && !isUploading)}
                          className="p-1.5 sm:p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex-shrink-0"
                        >
                          <Send size={18} />
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-4">
                      <h3 className={`text-xl font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
                        Select a contact to start chatting
                      </h3>
                      <p className={`mt-2 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                        Choose from your recent chats or search for someone new
                      </p>
                      {window.innerWidth < 768 && (
                        <button
                          onClick={() => setMobileView("list")}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                          View Contacts
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Media and Files Sidebar */}
                {showMediaFiles && selectedUser && (
                  <div
                    className={`w-full md:w-2/5 ${theme === "light" ? "bg-white md:border-l border-gray-200" : "bg-[#1E2A47] md:border-l border-gray-700/50"} flex flex-col h-full absolute md:relative inset-0 z-10`}
                  >
                    <button
                      onClick={() => setShowMediaFiles(false)}
                      className={`absolute top-4 right-4 p-2 rounded-full md:hidden ${theme === "light" ? "bg-gray-100 text-gray-600" : "bg-[#2B3B5E] text-gray-400"}`}
                    >
                      <X size={20} />
                    </button>
                    <div className="p-6 flex-shrink-0">
                      <h3 className={`font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"} mb-4`}>
                        Media
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 pt-0 scrollbar-hide">
                      <div className="grid grid-cols-2 gap-3">
                        {messages
                          .filter((msg) => msg.type === "image")
                          .slice(0, 6)
                          .map((message, i) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden">
                              <img
                                src={message.url || "/placeholder.svg"}
                                alt="Media"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null
                                  e.target.src = "/placeholder.svg?height=100&width=100&text=🖼️"
                                }}
                              />
                            </div>
                          ))}
                      </div>

                      <h3 className={`font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"} mt-8 mb-4`}>
                        Files
                      </h3>
                      <div className="space-y-4">
                        {messages
                          .filter((msg) => msg.type === "file")
                          .slice(0, 5)
                          .map((file, i) => (
                            <div key={i} className="flex items-center">
                              <div
                                className={`w-10 h-10 flex items-center justify-center rounded text-white bg-blue-500`}
                              >
                                DOC
                              </div>
                              <div className="ml-4">
                                <div className={`text-sm ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
                                  {file.fileName || "Document"}
                                </div>
                                <div className="text-xs text-gray-400">{file.fileSize || "Unknown size"}</div>
                              </div>
                            </div>
                          ))}

                        {messages.filter((msg) => msg.type === "file").length === 0 && (
                          <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                            No files shared in this conversation
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Message Context Menu */}
      <MessageContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        isRead={contextMenu.isRead}
        onDeleteForMe={handleDeleteForMe}
        onDeleteForEveryone={handleDeleteForEveryone}
        theme={theme}
      />

      {/* Profile Update Modal */}
      {showProfileUpdate && <ProfileUpdate user={user} theme={theme} onClose={() => setShowProfileUpdate(false)} />}
    </div>
  )
}

