import { NextResponse } from "next/server";
import pdf from "pdf-parse/lib/pdf-parse.js"; 
import mammoth from "mammoth"

export const config = {
  api: {
    bodyParser: false, // Important: disable Next.js default body parsing
  },
};

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get("file") as File
  if (!file){
    return NextResponse.json({error: "No file uploaded"}, {status: 400});
  }

  // Turn file into buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let text = "Unsupported file type"
  if (file.type === "application/pdf"){
    const data = await pdf(buffer)
    text = data.text
  }else if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ){
    const result = await mammoth.extractRawText({ buffer })
    text = result.value
  }

  return NextResponse.json({ text })
}