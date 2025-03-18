"use client"

import { useState, useRef, useEffect } from "react"
import {
  Sun,
  Moon,
  Bell,
  ShoppingCart,
  ChevronDown,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Menu,
  Search,
} from "lucide-react"

export default function AppNavbar({ user, onSignOut, setSidebarOpen, sidebarOpen, theme, setTheme, onProfileClick }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const notificationRef = useRef(null)
  const profileRef = useRef(null)
  const cartRef = useRef(null)
  const languageRef = useRef(null)

  const notifications = [
    { id: 1, text: "John sent you a message", time: "5 minutes ago", read: false },
    { id: 2, text: "New feature available", time: "1 hour ago", read: false },
    { id: 3, text: "Your subscription will expire soon", time: "1 day ago", read: true },
    { id: 4, text: "Meeting scheduled for tomorrow", time: "2 days ago", read: true },
  ]

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
  ]

  const cartItems = [
    { id: 1, name: "Premium Subscription", price: "$9.99" },
    { id: 2, name: "Chat Stickers Pack", price: "$4.99" },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false)
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setLanguageOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const unreadNotifications = notifications.filter((n) => !n.read).length

  // Toggle sidebar function
  const toggleSidebar = () => {
    // Toggle the locked state
    window.sidebarLocked = !window.sidebarLocked
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div
      className={`${theme === "light" ? "bg-white text-gray-800 border-gray-200" : "bg-[#1E2A47] text-white border-gray-700/50"} px-2 sm:px-4 md:px-6 py-3 flex items-center justify-between fixed top-0 right-0 ${sidebarOpen ? "left-16 md:left-64" : "left-16 md:left-20"} z-10 h-16 md:h-20 border-b transition-all duration-300`}
    >
      <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8">
        {/* Menu button to toggle sidebar */}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" : "text-gray-400 hover:text-gray-200 hover:bg-[#2B3B5E]"}`}
        >
          <Menu size={20} />
        </button>

        {/* Search bar */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={`w-40 lg:w-64 ${theme === "light" ? "bg-gray-100 text-gray-800" : "bg-[#2B3B5E]/50 text-gray-200"} placeholder-gray-400 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
          <div className="relative group">
            <button
              className={`flex items-center ${theme === "light" ? "text-gray-800" : "text-gray-200"} hover:text-blue-500 transition-colors text-sm font-medium`}
            >
              Apps
              <ChevronDown size={16} className="ml-1" />
            </button>
            <div
              className={`absolute left-0 mt-2 w-48 ${theme === "light" ? "bg-white border-gray-200 shadow-lg" : "bg-[#2B3B5E] border-gray-700"} rounded-md border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50`}
            >
              <div className="py-1">
                <a
                  href="#"
                  className={`block px-4 py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"}`}
                >
                  Calendar
                </a>
                <a
                  href="#"
                  className={`block px-4 py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"}`}
                >
                  Email
                </a>
                <a
                  href="#"
                  className={`block px-4 py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"}`}
                >
                  Chat
                </a>
                <a
                  href="#"
                  className={`block px-4 py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"}`}
                >
                  Tasks
                </a>
              </div>
            </div>
          </div>
          <button
            className={`${theme === "light" ? "text-blue-600" : "text-blue-400"} transition-colors text-sm font-medium`}
          >
            Chat
          </button>
          <button
            className={`${theme === "light" ? "text-gray-600 hover:text-gray-800" : "text-gray-400 hover:text-gray-200"} transition-colors text-sm`}
          >
            Calendar
          </button>
          <button
            className={`${theme === "light" ? "text-gray-600 hover:text-gray-800" : "text-gray-400 hover:text-gray-200"} transition-colors text-sm`}
          >
            Email
          </button>
        </nav>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" : "text-gray-400 hover:text-gray-200 hover:bg-[#2B3B5E]"}`}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Language Selector */}
        <div className="relative hidden sm:block" ref={languageRef}>
          <button
            onClick={() => setLanguageOpen(!languageOpen)}
            className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" : "text-gray-400 hover:text-gray-200 hover:bg-[#2B3B5E]"}`}
          >
            <span className="text-xl">🇬🇧</span>
          </button>

          {languageOpen && (
            <div
              className={`absolute right-0 mt-2 w-48 ${theme === "light" ? "bg-white border-gray-200 shadow-lg" : "bg-[#2B3B5E] border-gray-700"} rounded-md border z-50`}
            >
              <div className="py-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`flex items-center w-full px-4 py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"}`}
                    onClick={() => setLanguageOpen(false)}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Shopping Cart */}
        <div className="relative hidden sm:block" ref={cartRef}>
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" : "text-gray-400 hover:text-gray-200 hover:bg-[#2B3B5E]"} relative`}
          >
            <ShoppingCart size={20} />
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {cartItems.length}
            </span>
          </button>

          {cartOpen && (
            <div
              className={`absolute right-0 mt-2 w-72 ${theme === "light" ? "bg-white border-gray-200 shadow-lg" : "bg-[#2B3B5E] border-gray-700"} rounded-md border z-50`}
            >
              <div className={`px-4 py-3 border-b ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
                <h3 className="font-medium">Shopping Cart</h3>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`px-4 py-3 flex justify-between items-center ${theme === "light" ? "hover:bg-gray-50" : "hover:bg-[#3B4B6E]"}`}
                >
                  <div>
                    <p className={`text-sm font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>{item.price}</p>
                  </div>
                  <button className="text-xs text-blue-600 hover:underline">Remove</button>
                </div>
              ))}

              <div className={`px-4 py-3 border-t ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Total:</span>
                  <span className="text-sm font-medium">$14.98</span>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Checkout</button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" : "text-gray-400 hover:text-gray-200 hover:bg-[#2B3B5E]"} relative`}
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div
              className={`absolute right-0 mt-2 w-80 ${theme === "light" ? "bg-white border-gray-200 shadow-lg" : "bg-[#2B3B5E] border-gray-700"} rounded-md border z-50`}
            >
              <div
                className={`px-4 py-3 border-b ${theme === "light" ? "border-gray-200" : "border-gray-700"} flex justify-between items-center`}
              >
                <h3 className="font-medium">Notifications</h3>
                <span className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  {unreadNotifications} new
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 ${theme === "light" ? "hover:bg-gray-50" : "hover:bg-[#3B4B6E]"} ${!notification.read ? (theme === "light" ? "bg-blue-50" : "bg-blue-900/20") : ""}`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-2 h-2 mt-1.5 rounded-full ${!notification.read ? "bg-blue-600" : "bg-transparent"} mr-2`}
                      ></div>
                      <div className="flex-1">
                        <p className={`text-sm ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
                          {notification.text}
                        </p>
                        <p className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"} mt-1`}>
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`px-4 py-3 border-t ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
                <button className="text-xs text-blue-600 hover:underline">Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative group">
          <button
            className={`flex items-center space-x-2 p-1 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#2B3B5E]"}`}
            onClick={onProfileClick}
          >
            <img
              src={user?.photoURL || "/placeholder.svg?height=32&width=32"}
              alt={user?.email || "User"}
              className="w-8 h-8 rounded-full object-cover"
            />
          </button>

          <div
            className={`absolute right-0 mt-2 w-72 ${theme === "light" ? "bg-white border-gray-200 shadow-lg" : "bg-[#2B3B5E] border-gray-700"} rounded-md border z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300`}
          >
            <div
              className={`p-6 border-b ${theme === "light" ? "border-gray-200" : "border-gray-700"} flex items-center`}
            >
              <img
                src={user?.photoURL || "/placeholder.svg?height=64&width=64"}
                alt={user?.email || "User"}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="ml-4">
                <p className={`text-base font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
                  {user?.displayName || user?.email || "User"}
                </p>
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  {user?.email || "user@example.com"}
                </p>
                <p className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"} mt-1`}>User</p>
              </div>
            </div>

            <div className="py-2">
              <button
                onClick={onProfileClick}
                className={`flex items-center w-full px-6 py-3 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"}`}
              >
                <User size={18} className="mr-3" />
                Profile
              </button>
              <button
                className={`flex items-center w-full px-6 py-3 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"}`}
              >
                <Settings size={18} className="mr-3" />
                Settings
              </button>
              <button
                className={`flex items-center w-full px-6 py-3 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"}`}
              >
                <HelpCircle size={18} className="mr-3" />
                Help Center
              </button>
            </div>

            <div className={`py-2 border-t ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
              <button
                onClick={async () => {
                  try {
                    // Wait for the sign out process to complete
                    await onSignOut()
                    // Then redirect to the login page
                    window.location.href = "/"
                  } catch (error) {
                    console.error("Error signing out:", error)
                  }
                }}
                className={`flex items-center w-full px-6 py-3 text-sm text-red-600 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#3B4B6E]"}`}
              >
                <LogOut size={18} className="mr-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

