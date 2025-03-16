"use client"

import { useState, useEffect } from "react"
import {
  Home,
  ShoppingCart,
  DollarSign,
  BarChart2,
  Settings,
  Music,
  Calendar,
  Mail,
  LayoutGrid,
  ChevronDown,
} from "lucide-react"

export default function AppSidebar({ theme, setOpen, open }) {
  const [activeItem, setActiveItem] = useState("modern")
  const [dropMenu, setDropMenu] = useState(false) // Initially dropdown closed hoga

  // Home section items - 4 regular buttons
  const homeMenuItems = [
    { id: "modern", icon: <Home size={20} />, label: "Modern" },
    { id: "ecommerce", icon: <ShoppingCart size={20} />, label: "eCommerce" },
    { id: "nft", icon: <DollarSign size={20} />, label: "NFT" },
    { id: "crypto", icon: <BarChart2 size={20} />, label: "Crypto" },
  ]

  // Apps section items - 4 regular buttons
  const appsMenuItems = [
    { id: "music", icon: <Music size={20} />, label: "Music" },
    { id: "calendar", icon: <Calendar size={20} />, label: "Calendar" },
    { id: "email", icon: <Mail size={20} />, label: "Email" },
    { id: "frontend", icon: <LayoutGrid size={20} />, label: "Frontend" },
  ]

  // Handle mouse enter/leave for hover functionality
  useEffect(() => {
    // Only apply hover behavior if not locked by menu toggle
    const handleMouseEnter = () => {
      if (!window.sidebarLocked) {
        setOpen(true)
      }
    }

    const handleMouseLeave = () => {
      if (!window.sidebarLocked) {
        setOpen(false)
      }
    }

    const sidebarElement = document.getElementById("app-sidebar")
    if (sidebarElement) {
      sidebarElement.addEventListener("mouseenter", handleMouseEnter)
      sidebarElement.addEventListener("mouseleave", handleMouseLeave)
    }

    // Add scrollbar visibility control
    const navElement = document.querySelector("nav")
    let scrollTimer = null

    const handleScroll = () => {
      if (navElement) {
        // Add a class to show the scrollbar
        navElement.classList.add("scrolling")

        // Clear any existing timer
        if (scrollTimer) clearTimeout(scrollTimer)

        // Set a timer to remove the class after scrolling stops
        scrollTimer = setTimeout(() => {
          navElement.classList.remove("scrolling")
        }, 1000) // Hide after 1 second of inactivity
      }
    }

    if (navElement) {
      navElement.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (sidebarElement) {
        sidebarElement.removeEventListener("mouseenter", handleMouseEnter)
        sidebarElement.removeEventListener("mouseleave", handleMouseLeave)
      }

      if (navElement) {
        navElement.removeEventListener("scroll", handleScroll)
      }
      if (scrollTimer) clearTimeout(scrollTimer)
    }
  }, [setOpen])

  return (
    <div
      id="app-sidebar"
      className={`fixed top-0 left-0 h-full  ${
        theme === "light" ? "bg-white text-gray-800 border-gray-200" : "bg-[#171F2F] text-gray-300 border-gray-700"
      } shadow-lg z-20 border-r transition-all duration-300 ${open ? "w-16 md:w-64" : "w-16 md:w-20"}`}
    >
      <div className="flex flex-col h-full py-3 md:py-5">
        <div className="px-2 md:px-4 mb-4 md:mb-6 flex items-center">
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold ${
              open ? "mr-3" : ""
            }`}
          >
            E
          </div>
          {open && (
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent hidden md:block">
              EBAD BALOCH
            </span>
          )}
        </div>

        <nav
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            nav::-webkit-scrollbar {
              width: 5px;
              background: transparent;
            }
            nav::-webkit-scrollbar-thumb {
              background: transparent;
              border-radius: 20px;
            }
            nav:hover::-webkit-scrollbar-thumb {
              background: transparent;
            }
            /* Only show scrollbar when actively scrolling */
            @media (hover: hover) {
              nav {
                scrollbar-width: none;
              }
              nav::-webkit-scrollbar {
                display: none;
              }
              nav:active::-webkit-scrollbar,
              nav:focus::-webkit-scrollbar,
              nav::-webkit-scrollbar:hover {
                display: block;
              }
              nav:active::-webkit-scrollbar-thumb,
              nav:focus::-webkit-scrollbar-thumb,
              nav::-webkit-scrollbar-thumb:hover {
                background: ${theme === "light" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)"};
              }
            }
            
            nav.scrolling::-webkit-scrollbar-thumb {
              background: ${theme === "light" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)"};
            }
          `}</style>

          {/* HOME Section */}
          <div className="mb-4">
            <div
              className={`flex items-center justify-between px-3 md:px-6 py-2 ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {open ? (
                <span className="text-xs font-medium uppercase">HOME</span>
              ) : (
                <span className="text-xs font-medium uppercase mx-auto">...</span>
              )}
            </div>

            <ul className={`space-y-3 ${open ? "px-3 md:px-8" : "px-3 md:px-5"}`}>
              {/* Regular menu items - 4 buttons */}
              {homeMenuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`flex items-center w-full p-2.5 rounded-lg transition-colors ${
                      activeItem === item.id
                        ? theme === "light"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-blue-900/20 text-blue-400"
                        : theme === "light"
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-gray-400 hover:bg-[#2B3B5E]"
                    }`}
                    onClick={() => setActiveItem(item.id)}
                  >
                    {item.icon}
                    {open && <span className="ml-3 hidden md:inline">{item.label}</span>}
                  </button>
                </li>
              ))}

              {/* Dropdown menu - 1 button */}
              <li className="relative group">
                <button
                  className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                    theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"
                  }`}
                >
                  <Settings size={20} />
                  {open && (
                    <>
                      <span className="ml-3 flex-1">Settings</span>
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>

                {/* Dropdown content - only shows on hover when sidebar is open */}
                {open && (
                  <div
                    className={`absolute left-full top-0 w-48 ${
                      theme === "light" ? "bg-white border-gray-200 shadow-lg" : "bg-[#2B3B5E] border-gray-700"
                    } rounded-md border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 ml-2`}
                  >
                    <div className="py-1">
                      <a
                        href="#"
                        className={`block px-4 py-2 text-sm ${
                          theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"
                        }`}
                      >
                        General Settings
                      </a>
                      <a
                        href="#"
                        className={`block px-4 py-2 text-sm ${
                          theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"
                        }`}
                      >
                        Account Settings
                      </a>
                      <a
                        href="#"
                        className={`block px-4 py-2 text-sm ${
                          theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"
                        }`}
                      >
                        Preferences
                      </a>
                    </div>
                  </div>
                )}
              </li>
            </ul>
          </div>

          {/* APPS Section */}
          <div className="mb-4">
            <div
              className={`flex items-center justify-between px-3 md:px-6 py-2 ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {open ? (
                <span className="text-xs font-medium uppercase">APPS</span>
              ) : (
                <span className="text-xs font-medium uppercase mx-auto">...</span>
              )}
            </div>

            <ul className={`space-y-3 ${open ? "px-3 md:px-8" : "px-3 md:px-5"}`}>
              {/* Regular menu items - 4 buttons */}
              {appsMenuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`flex items-center w-full p-2.5 rounded-lg transition-colors ${
                      activeItem === item.id
                        ? theme === "light"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-blue-900/20 text-blue-400"
                        : theme === "light"
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-gray-400 hover:bg-[#2B3B5E]"
                    }`}
                    onClick={() => setActiveItem(item.id)}
                  >
                    {item.icon}
                    {open && <span className="ml-3 hidden md:inline">{item.label}</span>}
                  </button>
                </li>
              ))}

              {/* Tools dropdown */}
              <li className="relative">
                <button
                  className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${
                    activeItem === "Tools"
                      ? theme === "light"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-blue-900/20 text-blue-400"
                      : theme === "light"
                        ? "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                        : "text-gray-400 hover:bg-[#2B3B5E] active:bg-[#1E2A45]"
                  }`}
                  onClick={() => {
                    setDropMenu(!dropMenu) // Toggle the dropdown
                    setActiveItem("Tools") // Set activeItem to "Tools"
                  }} // Click pe "Tools" ko active karo
                >
                  <div className="flex items-center">
                    <Settings
                      size={20}
                      className={`${
                        activeItem === "Tools"
                          ? theme === "light"
                            ? "text-blue-600"
                            : "text-blue-400"
                          : theme === "light"
                            ? "text-gray-700"
                            : "text-gray-400"
                      }`} // Icon ka color change hoga based on activeItem
                    />
                    <span
                      className={`ml-3 ${
                        activeItem === "Tools"
                          ? theme === "light"
                            ? "text-blue-600"
                            : "text-blue-400"
                          : theme === "light"
                            ? "text-gray-700"
                            : "text-gray-400"
                      }`}
                    >
                      Tools
                    </span>
                  </div>

                  {/* Arrow rotation */}
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform duration-300 ${dropMenu ? "rotate-90" : "rotate-0"}`}
                  />
                </button>

                {/* Dropdown content - will show only on click */}
                {dropMenu && (
                  <div
                    className={`absolute top-full mt-2 w-48 ${
                      theme === "light" ? "bg-white border-gray-200 shadow-lg" : "bg-[#2B3B5E] border-gray-700"
                    } rounded-md border transition-all duration-300 z-50`}
                  >
                    <div className="py-1">
                      <a
                        href="#"
                        className={`block px-4 py-2 text-sm ${
                          theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"
                        }`}
                      >
                        File Manager
                      </a>
                      <a
                        href="#"
                        className={`block px-4 py-2 text-sm ${
                          theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"
                        }`}
                      >
                        Task Manager
                      </a>
                      <a
                        href="#"
                        className={`block px-4 py-2 text-sm ${
                          theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"
                        }`}
                      >
                        Notes
                      </a>
                    </div>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </nav>

        <div className="mt-auto px-2 md:px-3">
          <div className={`flex items-center p-2 rounded-lg ${theme === "light" ? "bg-gray-100" : "bg-[#2B3B5E]/50"}`}>
            <img
              src="https://res.cloudinary.com/dfnpekedc/image/upload/v1741934382/wxtvohrwuc2b70sow9jo.jpg"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            {open && (
              <div className="ml-3 text-sm hidden md:block">
                <div className={`font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
                  EBAD BALOCH
                </div>
                <div className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>Designer</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

