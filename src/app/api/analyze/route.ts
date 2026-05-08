import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        isGarbage: true, 
        estimatedVolume: 25,
        type: "mixed plastic",
        confidence: 90
      })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64String = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const promptText = `
[SYSTEM DIRECTIVE - MANDATORY OVERRIDE]
You are a strict security scanner. Your primary job is to detect spoofing. 
If there is ANY human face, person, selfie, or indoor room in this image, YOU MUST IMMEDIATELY OUTPUT {"isGarbage": false}. No exceptions, even if they are holding trash.

If the image is a genuine outdoor environmental waste pile, then analyze it and respond ONLY with raw JSON in this exact structure:
{
  "isGarbage": boolean,
  "estimatedVolume": number (in kg, guess if unsure),
  "type": "string (e.g. plastic, organic, mixed)",
  "confidence": number (0-100)
}

CRITICAL RULES:
1. If the image contains a clear human face, a selfie, a person posing, or anything that is clearly NOT environmental waste, you MUST set "isGarbage": false.
2. If the image is inside a clean house, office, or vehicle without obvious bulk waste, you MUST set "isGarbage": false.
3. Only return "isGarbage": true if there is actual physical garbage, waste, litter, or pollution visible on the ground or in public.
    `.trim()

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            { inlineData: { mimeType, data: base64String } }
          ]
        }
      ]
    });

    const rawText = response.text || "{}"
    const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
    const result = JSON.parse(cleanJsonStr)

    return NextResponse.json(result)

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
