"use client"

import { useEffect, useRef } from "react"
import { Trash2, X } from "lucide-react"

export default function MessageContextMenu({
  isOpen,
  position,
  onClose,
  isRead,
  onDeleteForMe,
  onDeleteForEveryone,
  theme,
}) {
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className={`absolute z-50 ${theme === "light" ? "bg-white shadow-lg border border-gray-200" : "bg-[#2B3B5E] border border-gray-700"} rounded-md py-1 w-48 max-w-[90vw]`}
      style={{
        top: position.y,
        left: Math.min(position.x, window.innerWidth - 200),
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <span className={`text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>
          Message Options
        </span>
        <button
          onClick={onClose}
          className={`p-1 rounded-full ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#3B4B6E]"}`}
        >
          <X size={14} />
        </button>
      </div>

      <button
        onClick={() => {
          onDeleteForMe()
          onClose()
        }}
        className={`flex items-center w-full px-4 py-3 text-sm ${theme === "light" ? "text-red-600 hover:bg-gray-100" : "text-red-400 hover:bg-[#3B4B6E]"}`}
      >
        <Trash2 size={16} className="mr-2" />
        Delete for me
      </button>

      {!isRead && (
        <button
          onClick={() => {
            onDeleteForEveryone()
            onClose()
          }}
          className={`flex items-center w-full px-4 py-3 text-sm ${theme === "light" ? "text-red-600 hover:bg-gray-100" : "text-red-400 hover:bg-[#3B4B6E]"}`}
        >
          <Trash2 size={16} className="mr-2" />
          Delete for everyone
        </button>
      )}
    </div>
  )
}

