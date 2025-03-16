"use client"

import { useState, useEffect, useRef } from "react"
import {
  Menu,
  MoreVertical,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Mail,
  Calendar,
  Settings,
  Home,
  ChevronRight,
  X,
  Sun,
  Moon,
  ShoppingCart,
} from "lucide-react"

export default function MobileNavigation({
  user,
  theme,
  onSignOut,
  onProfileClick,
  toggleSidebar,
  sidebarOpen,
  setTheme,
  setExpandedNavbarState,
  mobileView,
}) {
  const [expandedNavbar, setExpandedNavbar] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [chatListOpen, setChatListOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const navbarRef = useRef(null)
  const drawerRef = useRef(null)
  const moreMenuRef = useRef(null)

  // Close navbar and drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside both the navbar and the button that opens it
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target) &&
        !moreMenuRef.current.contains(event.target)
      ) {
        setExpandedNavbar(false)
        setExpandedNavbarState && setExpandedNavbarState(false)
      }

      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        !event.target.closest("[data-drawer-toggle]")
      ) {
        setDrawerOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setExpandedNavbarState])

  // Close drawer when escape key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setDrawerOpen(false)
        setExpandedNavbar(false)
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => document.removeEventListener("keydown", handleEscKey)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <>
      {/* Top Navigation Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-30 ${theme === "light" ? "bg-white border-gray-200" : "bg-[#1E2A47] border-gray-700"} border-b h-14 px-4 flex items-center justify-between md:hidden`}
      >
        <div className="flex items-center">
          <button
            onClick={() => {
              toggleSidebar()
              // Close chat list if it's open
              if (chatListOpen) {
                setChatListOpen(false)
              }
            }}
            className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"}`}
          >
            <Menu size={22} />
          </button>
          <div className="ml-3 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
              E
            </div>
            <span className="ml-2 text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              CHAT
            </span>
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => {
              setChatListOpen(!chatListOpen)
              // Close sidebar if it's open on mobile
              if (sidebarOpen && window.innerWidth < 768) {
                toggleSidebar()
              }
            }}
            className={`p-2 rounded-lg mr-2 ${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"} ${chatListOpen ? (theme === "light" ? "bg-gray-100" : "bg-[#2B3B5E]") : ""}`}
          >
            <MessageSquare size={20} />
          </button>

          <button
            ref={moreMenuRef}
            onClick={(e) => {
              e.stopPropagation() // Stop event propagation
              const newState = !expandedNavbar
              setExpandedNavbar(newState)
              setExpandedNavbarState && setExpandedNavbarState(newState)
            }}
            className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"} ${expandedNavbar ? (theme === "light" ? "bg-gray-100" : "bg-[#2B3B5E]") : ""}`}
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Expanded Navbar (appears when three dots are clicked) */}
      {expandedNavbar && (
        <div
          ref={navbarRef}
          className={`fixed top-14 left-0 right-0 z-20 ${theme === "light" ? "bg-white border-gray-200" : "bg-[#1E2A47] border-gray-700"} border-b shadow-md md:hidden mobile-expanded-navbar`}
        >
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"}`}
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"}`}
              >
                <span className="text-xl">🇬🇧</span>
              </button>

              <button
                className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"} relative`}
              >
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </button>

              <button
                className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"}`}
              >
                <Bell size={20} />
              </button>
            </div>

            <button
              data-drawer-toggle
              onClick={() => {
                setDrawerOpen(!drawerOpen)
              }}
              className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"} ${drawerOpen ? (theme === "light" ? "bg-gray-100" : "bg-[#2B3B5E]") : ""}`}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Right Side Drawer (appears when menu bar is clicked) */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-40 h-screen w-64 ${theme === "light" ? "bg-white" : "bg-[#1E2A47]"} shadow-lg transform transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "translate-x-full"} md:hidden`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-semibold ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}>Menu</h2>
            <button
              onClick={() => setDrawerOpen(false)}
              className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"}`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center mb-6">
            <img
              src={user?.photoURL || "/placeholder.svg?height=40&width=40"}
              alt={user?.email || "User"}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-3">
              <div className={`font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
                {user?.displayName || user?.email || "User"}
              </div>
              <div className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                {user?.email || "user@example.com"}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <button
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#2B3B5E]"}`}
            >
              <div className="flex items-center">
                <Home size={18} className="mr-3" />
                <span className={`${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>Home</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            <button
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#2B3B5E]"}`}
            >
              <div className="flex items-center">
                <MessageSquare size={18} className="mr-3" />
                <span className={`${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>Messages</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            <button
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#2B3B5E]"}`}
            >
              <div className="flex items-center">
                <Mail size={18} className="mr-3" />
                <span className={`${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>Mail</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            <button
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#2B3B5E]"}`}
            >
              <div className="flex items-center">
                <Calendar size={18} className="mr-3" />
                <span className={`${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>Calendar</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            <button
              onClick={() => {
                onProfileClick()
                setDrawerOpen(false)
              }}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#2B3B5E]"}`}
            >
              <div className="flex items-center">
                <User size={18} className="mr-3" />
                <span className={`${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>Profile</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            <button
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#2B3B5E]"}`}
            >
              <div className="flex items-center">
                <Settings size={18} className="mr-3" />
                <span className={`${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>Settings</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  onSignOut()
                  setDrawerOpen(false)
                }}
                className={`flex items-center w-full px-3 py-2.5 rounded-lg text-red-500 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#2B3B5E]"}`}
              >
                <LogOut size={18} className="mr-3" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Sidebar Overlay (when sidebar is open) */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={toggleSidebar} />}

      {/* Chat List Toggle Indicator */}
      <div
        className={`fixed top-14 left-0 right-0 z-20 h-1 transition-opacity duration-300 ${chatListOpen ? "opacity-100" : "opacity-0"}`}
      >
        <div className="h-full bg-blue-500"></div>
      </div>
    </>
  )
}

