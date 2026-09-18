interface FeedbackBody {
  videoId?: string;
  name?: string;
  rating?: number;
  message?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const body: FeedbackBody = await request.json();

    if (!body.videoId || typeof body.videoId !== 'string') {
      return json({ error: 'videoId is required' }, 400);
    }
    const rating = Number(body.rating);
    if (!rating || rating < 1 || rating > 5) {
      return json({ error: 'Pick a rating' }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO feedback (video_id, name, rating, message, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    ).bind(
      body.videoId.trim(),
      body.name?.trim() || null,
      rating,
      body.message?.trim() || ''
    ).run();

    return json({ success: true }, 200);
  } catch (err) {
    console.error('Feedback error:', err);
    return json({ error: 'Server error' }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

function json(data: object, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
