import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MarkerBodySchema, MarkerDeleteBodySchema } from '@/lib/reports/schemas'
import type { MarkerResponse } from '@/lib/reports/schemas'
import type { Database } from '@/lib/types/database'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars missing')
  return createClient<Database>(url, key)
}

export async function POST(request: Request): Promise<NextResponse<MarkerResponse>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'リクエストの解析に失敗しました' }, { status: 400 })
  }

  const parsed = MarkerBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: '入力データが不正です' }, { status: 400 })
  }

  const { reportId, sectionId, sectionText, userId } = parsed.data

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('know_markers')
      .upsert(
        {
          user_id: userId ?? null,
          report_id: reportId,
          section_id: sectionId,
          section_text: sectionText ?? null,
        },
        { onConflict: 'user_id,report_id,section_id', ignoreDuplicates: false },
      )
      .select('id')
      .single()

    if (error) {
      console.error('marker insert error:', error)
      return NextResponse.json({ success: false, error: 'マーカーの保存に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true, markerId: data.id })
  } catch (err) {
    console.error('markers POST error:', err)
    return NextResponse.json({ success: false, error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function DELETE(request: Request): Promise<NextResponse<MarkerResponse>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'リクエストの解析に失敗しました' }, { status: 400 })
  }

  const parsed = MarkerDeleteBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: '入力データが不正です' }, { status: 400 })
  }

  const { reportId, sectionId, userId } = parsed.data

  try {
    const supabase = getSupabase()
    let deleteQuery = supabase
      .from('know_markers')
      .delete()
      .eq('report_id', reportId)
      .eq('section_id', sectionId)

    if (userId) deleteQuery = deleteQuery.eq('user_id', userId)

    const { error } = await deleteQuery

    if (error) {
      console.error('marker delete error:', error)
      return NextResponse.json({ success: false, error: 'マーカーの削除に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('markers DELETE error:', err)
    return NextResponse.json({ success: false, error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
