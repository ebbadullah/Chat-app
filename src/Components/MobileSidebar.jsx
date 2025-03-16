"use client"

import { useState } from "react"
import {
  X,
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

export default function MobileSidebar({ theme, open, setOpen }) {
  const [activeItem, setActiveItem] = useState("modern")
  const [dropMenu, setDropMenu] = useState(false)

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

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 ${
        theme === "light" ? "bg-white text-gray-800 border-gray-200" : "bg-[#171F2F] text-gray-300 border-gray-700"
      } shadow-lg z-40 border-r transition-all duration-300 transform ${
        open ? "translate-x-0" : "-translate-x-full"
      } md:hidden`}
    >
      <div className="flex flex-col h-full py-3">
        {/* Close button - only visible on mobile */}
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
              E
            </div>
            <span className="ml-2 text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              CHAT
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className={`p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"}`}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {/* HOME Section */}
          <div className="mb-4">
            <div
              className={`flex items-center justify-between px-6 py-2 ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              <span className="text-xs font-medium uppercase">HOME</span>
            </div>

            <ul className="space-y-3 px-4">
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
                    <span className="ml-3">{item.label}</span>
                  </button>
                </li>
              ))}

              {/* Dropdown menu - 1 button */}
              <li className="relative">
                <button
                  className={`flex items-center justify-between w-full p-2.5 rounded-lg transition-colors ${
                    theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"
                  }`}
                  onClick={() => setDropMenu(!dropMenu)}
                >
                  <div className="flex items-center">
                    <Settings size={20} />
                    <span className="ml-3">Settings</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform duration-300 ${dropMenu ? "rotate-180" : "rotate-0"}`}
                  />
                </button>

                {/* Dropdown content */}
                {dropMenu && (
                  <div className="pl-10 mt-1 space-y-1">
                    <a
                      href="#"
                      className={`block px-3 py-2 text-sm rounded-md ${
                        theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"
                      }`}
                    >
                      General Settings
                    </a>
                    <a
                      href="#"
                      className={`block px-3 py-2 text-sm rounded-md ${
                        theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"
                      }`}
                    >
                      Account Settings
                    </a>
                    <a
                      href="#"
                      className={`block px-3 py-2 text-sm rounded-md ${
                        theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#3B4B6E]"
                      }`}
                    >
                      Preferences
                    </a>
                  </div>
                )}
              </li>
            </ul>
          </div>

          {/* APPS Section */}
          <div className="mb-4">
            <div
              className={`flex items-center justify-between px-6 py-2 ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              <span className="text-xs font-medium uppercase">APPS</span>
            </div>

            <ul className="space-y-3 px-4">
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
                    <span className="ml-3">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="mt-auto px-4 pb-4">
          <div className={`flex items-center p-2 rounded-lg ${theme === "light" ? "bg-gray-100" : "bg-[#2B3B5E]/50"}`}>
            <img
              src="https://res.cloudinary.com/dfnpekedc/image/upload/v1741934382/wxtvohrwuc2b70sow9jo.jpg"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <div className="ml-3 text-sm">
              <div className={`font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>EBAD BALOCH</div>
              <div className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>Designer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

