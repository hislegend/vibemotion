import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { text, voiceId = '21m00Tcm4TlvDq8ikWAM' } = await req.json(); // Rachel (다국어 자연스러움)

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
            style: 0.55,
          },
          ...(text.match(/[가-힣]/) ? { language_code: 'ko' } : {}),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch {
    return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 });
  }
}
