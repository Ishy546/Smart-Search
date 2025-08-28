"use client"
import { useState } from "react"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
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

      const data = await res.json()
      setText(data.text)
    } catch (err) {
      console.error("Error uploading:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-500 min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="w-full max-w-3xl space-y-6">
        {/* Upload Card */}
        <form
          onSubmit={handleSubmit}
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

        {/* Chat Output */}
        {text && (
          <div className="space-y-4">
            <div className="flex justify-start">
              <div className="bg-gray-700 text-white px-4 py-3 rounded-2xl max-w-lg">
                File uploaded successfully! Here’s the extracted text:
              </div>
            </div>

            <div className="flex justify-end">
              <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl max-w-lg whitespace-pre-wrap">
                {text}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}