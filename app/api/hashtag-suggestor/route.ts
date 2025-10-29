import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { keywords } = await req.json()

    if (!keywords) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      )
    }

    const prompt = `Generate relevant hashtags for social media content about: "${keywords}"

Create 8-12 hashtags that are:
- Relevant to the topic
- Popular and trending
- Mix of specific and broad hashtags
- Good for social media engagement

Format them as a simple list with # symbols, one per line. No explanations or extra text.

Example format:
#keyword
#relatedtag
#trendingtag`

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
    
    // Parse hashtags from response
    let hashtags: string[] = []
    
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    if (responseText) {
      // Extract hashtags from the response
      const hashtagMatches = responseText.match(/#\w+/g)
      if (hashtagMatches) {
        hashtags = hashtagMatches.slice(0, 12) // Limit to 12 hashtags
      } else {
        // Fallback: create hashtags from keywords if no hashtags found
        const words = keywords.split(' ').filter((word: string) => word.length > 2)
        hashtags = words.map((word: string) => `#${word.toLowerCase()}`)
      }
    }
    
    // Ensure we have at least some hashtags
    if (hashtags.length === 0) {
      hashtags = [`#${keywords.toLowerCase().replace(/\s+/g, '')}`, '#social', '#content']
    }
    
    return NextResponse.json({ 
      hashtags: hashtags,
      copyText: hashtags.join(' ')
    })
  } catch (error) {
    console.error('Hashtag Suggestor API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate hashtags' },
      { status: 500 }
    )
  }
} 