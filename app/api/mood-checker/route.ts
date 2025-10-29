import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const prompt = `Analyze the mood and sentiment of the following text: "${text}"

Classify the mood as one of these options: happy, sad, angry, excited, neutral, anxious, love, frustrated

Respond with ONLY the mood word, nothing else. Pick the best single word that describes the overall sentiment.`

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
    
    // Clean up the response to get just the mood
    let mood = data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase().trim() || 'neutral'
    
    // Extract just the first word if there are multiple words
    mood = mood.split(' ')[0]
    
    // Map to emoji
    const moodEmojis: { [key: string]: string } = {
      'happy': '😊',
      'sad': '😢',
      'angry': '😠',
      'excited': '🤩',
      'neutral': '😐',
      'anxious': '😰',
      'love': '😍',
      'frustrated': '😤'
    }
    
    const emoji = moodEmojis[mood] || '😐'
    
    return NextResponse.json({ 
      mood: mood,
      emoji: emoji,
      confidence: 'high'
    })
  } catch (error) {
    console.error('Mood Checker API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze mood' },
      { status: 500 }
    )
  }
} 