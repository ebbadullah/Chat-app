"use client"
import { Search, X } from "lucide-react"

export default function MobileChatList({
  theme,
  isOpen,
  onClose,
  recentChats,
  searchQuery,
  setSearchQuery,
  isSearching,
  searchResults,
  onSelectUser,
  selectedUser,
  unreadCounts,
  formatTime,
}) {
  return (
    <div
      className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      } md:hidden`}
    >
      <div
        className={`absolute top-14 left-0 right-0 bottom-0 ${
          theme === "light" ? "bg-white" : "bg-[#1E2A47]"
        } transition-transform duration-300 transform ${isOpen ? "translate-y-0" : "translate-y-full"} mobile-chat-container`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 mobile-chat-header">
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}>Chats</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-[#2B3B5E]"}`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 mobile-chat-header">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                      onClick={() => {
                        onSelectUser(searchUser)
                        onClose()
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
                <div className="py-4 text-center">
                  <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>No users found</p>
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
                    onClick={() => {
                      onSelectUser(chat)
                      onClose()
                    }}
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
    </div>
  )
}

