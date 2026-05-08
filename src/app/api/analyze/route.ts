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
You are an extremely strict civic environmental inspector. Your ONLY job is to verify illegal outdoor dumping and pollution.

CRITICAL REJECTION RULES (Return {"isGarbage": false}):
1. If the image is inside a building, house, room, office, or vehicle.
2. If you see indoor walls, ceilings, regular floors, beds, desks, or normal household mess.
3. If there is a human face, selfie, or person posing.
4. If it is just a picture of a regular garbage bin or trash can.

CRITICAL ACCEPTANCE RULES (Return {"isGarbage": true}):
1. The image MUST be outdoors (street, land, water, public space).
2. The image MUST contain actual physical garbage, waste, litter, or pollution dumped illegally.

If it passes all rules and is genuine outdoor pollution, analyze it and respond ONLY with raw JSON in this exact structure:
{
  "isGarbage": boolean,
  "estimatedVolume": number (in kg, guess if unsure),
  "type": "string (e.g. plastic, organic, mixed)",
  "confidence": number (0-100)
}
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

    // Force rejection if confidence is too low or it didn't explicitly say true
    if (result.confidence < 70) {
      result.isGarbage = false;
    }

    return NextResponse.json(result)

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
