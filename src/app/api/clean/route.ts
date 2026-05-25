import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    const originalImageUrl = formData.get('originalImageUrl') as string | null
    const reportId = formData.get('reportId') as string | null

    if (!file || !originalImageUrl || !reportId) {
      return NextResponse.json({ error: 'Missing required payload' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: true, credits: 500, aiReason: "Simulation mode (No API Key)" })
    }

    // Process "After" image
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64String = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'

    // Process "Before" image
    let originalBase64 = ""
    let originalMime = "image/jpeg"
    try {
       const origRes = await fetch(originalImageUrl)
       const origBuffer = await origRes.arrayBuffer()
       originalBase64 = Buffer.from(origBuffer).toString('base64')
       originalMime = origRes.headers.get('content-type') || 'image/jpeg'
    } catch(e) {
       return NextResponse.json({ error: 'Could not fetch original image.' }, { status: 400 })
    }

    const promptText = `
You are an expert AI waste forensics engine for Swatchbandhu.
You are given TWO images:
1. The first image is the "Before" photo showing waste/pollution.
2. The second image is the "After" photo, submitted by a citizen who claims to have cleaned it up.

Your critical task:
Analyze both images side-by-side to verify if the waste shown in the "Before" photo has genuinely been removed or cleaned in the "After" photo.
CRITICAL FRAUD PREVENTION RULE: You MUST verify that the background, floor texture, lighting, and surrounding environment EXACTLY MATCH between the two photos. 
- If the user just took a picture of a random clean floor in their house or a different street, you MUST REJECT IT and set "isMatch": false.
- If the environment perfectly matches but the garbage is still there or just moved slightly, set "isCleaned": false.
- ONLY if the environment perfectly matches AND the garbage is completely gone, set "isMatch": true and "isCleaned": true.

Respond ONLY with valid, raw JSON in this exact structure:
{
  "isMatch": boolean,
  "isCleaned": boolean,
  "confidenceScore": number,
  "reason": "string explaining the decision briefly"
}
    `.trim()

    let aiResult;
    try {
       const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: [
           {
             role: "user",
             parts: [
               { text: promptText },
               { inlineData: { mimeType: originalMime, data: originalBase64 } },
               { inlineData: { mimeType, data: base64String } }
             ]
           }
         ],
         config: {
           responseMimeType: 'application/json',
           responseSchema: {
             type: 'OBJECT',
             properties: {
               isMatch: { type: 'BOOLEAN' },
               isCleaned: { type: 'BOOLEAN' },
               confidenceScore: { type: 'INTEGER' },
               reason: { type: 'STRING' }
             },
             required: ['isMatch', 'isCleaned', 'confidenceScore', 'reason']
           }
         }
       });
       const rawText = response.text || "{}"
       const cleanJsonStr = rawText.trim()
       aiResult = JSON.parse(cleanJsonStr)
    } catch (e) {
       return NextResponse.json({ error: 'AI Evaluation Failed' }, { status: 500 })
    }

    if (!aiResult.isMatch) {
       return NextResponse.json({ success: false, error: "Environment mismatch. Ensure you take the photo from a similar angle.", credits: 0 })
    }

    if (!aiResult.isCleaned) {
       return NextResponse.json({ success: false, error: aiResult.reason, credits: 0 })
    }

    return NextResponse.json({ 
      success: true, 
      reportId,
      credits: 500,
      aiReason: aiResult.reason
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
