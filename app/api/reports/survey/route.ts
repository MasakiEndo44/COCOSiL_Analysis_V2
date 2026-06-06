import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SurveyBodySchema } from '@/lib/reports/schemas'
import type { SurveyResponse } from '@/lib/reports/schemas'
import type { Database } from '@/lib/types/database'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars missing')
  return createClient<Database>(url, key)
}

export async function POST(request: Request): Promise<NextResponse<SurveyResponse>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'リクエストの解析に失敗しました' }, { status: 400 })
  }

  const parsed = SurveyBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: '入力データが不正です' }, { status: 400 })
  }

  const { reportId, score, comment, userId } = parsed.data

  try {
    const supabase = getSupabase()
    const { error } = await supabase.from('events_telemetry').insert({
      user_id: userId ?? 'anonymous',
      event_name: 'report_survey',
      payload: {
        score,
        comment: comment ?? '',
        report_id: reportId,
      },
    })

    if (error) {
      console.error('survey insert error:', error)
      return NextResponse.json({ success: false, error: '送信に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('survey POST error:', err)
    return NextResponse.json({ success: false, error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
