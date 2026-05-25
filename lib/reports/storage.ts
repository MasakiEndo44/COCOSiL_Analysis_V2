import { createClient } from '@supabase/supabase-js'
import { getServerEnv } from '@/lib/env'

const BUCKET = 'user-reports'

function getAdminClient() {
  const env = getServerEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase URL or service role key is not configured')
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}

export async function uploadReportImage(
  userId: string | null,
  reportId: string,
  imageBuffer: ArrayBuffer,
): Promise<string | null> {
  try {
    const supabase = getAdminClient()
    const folder = userId ?? 'anonymous'
    const path = `${folder}/${reportId}.png`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (error) {
      console.error('[storage] upload error:', error)
      return null
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  } catch (err) {
    console.error('[storage] unexpected error:', err)
    return null
  }
}

export async function saveReportRecord(params: {
  userId: string | null
  diagnosisId: string | undefined
  mbtiResultId: string | undefined
  content: object
  storageUrl: string | null
  status: 'completed' | 'failed'
}): Promise<string | null> {
  try {
    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from('user_reports')
      .insert({
        user_id: params.userId ?? null,
        diagnosis_id: params.diagnosisId ?? null,
        mbti_result_id: params.mbtiResultId ?? null,
        content: params.content,
        storage_url: params.storageUrl,
        generation_status: params.status,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[storage] db insert error:', error)
      return null
    }

    return data?.id ?? null
  } catch (err) {
    console.error('[storage] db unexpected error:', err)
    return null
  }
}
