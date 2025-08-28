"use client"
import { useState } from "react"

type Message = {
  role: "user" | "computer",
  content: string
}
export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(""); // For typing queries
  const [queriesLeft, setQueriesLeft] = useState(10) // Example query limit

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      // this is where the text gets embedded.
      // Add initial computer message
      setMessages([
        {
          role: "computer",
          content: `File uploaded! You have ${queriesLeft} queries left.`,
        },
      ])
    } catch (err) {
      console.error("Error uploading:", err)
    } finally {
      setLoading(false)
    }
  }

  // Handle user query submission
  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault()// no reloading after submit
    if (!input.trim() || queriesLeft <= 0) return// if query box is empty or no queries remain, do nothing

    const userMessage: Message = { role: "user", content: input }// push message to ui
    setMessages((prev) => [...prev, userMessage])
    setInput("")//clear input field
    setLoading(true)//disable ui elements
    setQueriesLeft((prev) => prev - 1)//decrement query count

    try {
      const res = await fetch("/api/query", {//sends the user’s query plus the filename of the uploaded doc.
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, fileName: file?.name }),
      })
      const data = await res.json()

      const computerMessage: Message = { role: "computer", content: data.answer }// adds the ai's answer
      setMessages((prev) => [...prev, computerMessage])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

   return (
    <div className="bg-slate-500 min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="w-full max-w-3xl space-y-6">

        {/* Upload Card */}
        {messages.length === 0 && (
          <form
            onSubmit={handleUpload}
            className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 text-center"
          >
            <label className="block">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="fileInput"
              />
              <div className="cursor-pointer border-2 border-dashed border-gray-600 rounded-xl p-8 hover:border-blue-400 transition">
                <p className="text-lg font-medium">
                  {file ? file.name : "Click or drag a file here to upload"}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Supported: PDF, DOCX
                </p>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition"
            >
              {loading ? "Processing..." : "Upload & Parse"}
            </button>
          </form>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl max-w-lg whitespace-pre-wrap ${
                    msg.role === "user" ? "bg-gray-700 text-white" : "bg-blue-600 text-white"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input for queries */}
        {messages.length > 0 && queriesLeft > 0 && (
          <form onSubmit={handleQuerySubmit} className="flex mt-4 space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2 rounded-xl border border-gray-600 bg-gray-800 text-white focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              Send
            </button>
          </form>
        )}

        {/* Optional message when queries run out */}
        {messages.length > 0 && queriesLeft === 0 && (
          <div className="text-center text-gray-300 mt-2">
            You have used all your queries.
          </div>
        )}

      </div>
    </div>
  )
}