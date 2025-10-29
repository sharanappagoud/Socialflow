import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageDescription } = await req.json()

    if (!imageDescription) {
      return NextResponse.json(
        { error: 'Image description is required' },
        { status: 400 }
      )
    }

    const prompt = `Create an engaging Instagram caption for an image with the following description: "${imageDescription}"

The caption should be:
- Fun and engaging
- Include relevant emojis
- Be 1-2 sentences long
- Perfect for social media sharing
- Creative and attention-grabbing

Generate just the caption, no extra text or explanations.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=AIzaSyB8f6BpfncF899Z3UuaLycaAoPFZsqlCZ8`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get response from Gemini API')
    }

    const data = await response.json()
    
    return NextResponse.json({ 
      caption: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate caption' 
    })
  } catch (error) {
    console.error('Caption Generator API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate caption' },
      { status: 500 }
    )
  }
} 