// Supabase Edge Function — OpenAI AI Summary
// Deploy: npx supabase functions deploy ai-summary --no-verify-jwt
// Set secret: npx supabase secrets set OPENAI_API_KEY=sk-...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { patient, checkins } = await req.json();

    const checkInSummary = checkins
      .slice(0, 7)
      .map((c: Record<string, unknown>) => {
        const symptoms = (c.symptoms as string[]) || [];
        const bp = c.systolic && c.diastolic ? `BP ${c.systolic}/${c.diastolic}` : 'BP not recorded';
        const glucose = c.glucose ? `Glucose ${c.glucose} mg/dL` : '';
        const meds = c.medicationTaken ? 'Meds: taken' : 'Meds: MISSED';
        const barrier = c.barrierNote ? `Note: "${c.barrierNote}"` : '';
        return `- ${c.date}: ${bp}, ${glucose ? glucose + ', ' : ''}${meds}, Symptoms: ${symptoms.join(', ') || 'none'}${barrier ? ', ' + barrier : ''}`;
      })
      .join('\n');

    const prompt = `You are a clinical decision support assistant for a chronic care follow-up system. Given the following patient data, provide a concise clinical summary (3-4 sentences) and a suggested next action (1-2 sentences).

Patient: ${patient.name}, ${patient.age}yo, ${patient.condition}, on ${patient.medication} (${patient.medicationFrequency}).

Recent check-ins (most recent first):
${checkInSummary}

Respond in JSON format: { "summary": "...", "suggestedAction": "..." }

Important: Do not diagnose. Focus on adherence patterns, vital sign trends, and follow-up recommendations. Be concise and clinically useful.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
