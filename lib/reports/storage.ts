import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

const BUCKET = 'user-reports'

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars missing')
  return createClient<Database>(url, key)
}

export interface UploadResult {
  publicUrl: string
  path: string
}

export async function uploadReportImage(
  userId: string,
  reportId: string,
  pngBuffer: ArrayBuffer,
): Promise<UploadResult> {
  const supabase = getStorageClient()
  const path = `${userId}/${reportId}.png`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, pngBuffer, {
      contentType: 'image/png',
      upsert: true,
    })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { publicUrl: data.publicUrl, path }
}

export async function saveReportRecord(
  userId: string | null,
  storageUrl: string,
): Promise<string> {
  const supabase = getStorageClient()
  const { data, error } = await supabase
    .from('reports')
    .insert({ user_id: userId, storage_url: storageUrl })
    .select('id')
    .single()

  if (error) throw new Error(`reports insert failed: ${error.message}`)
  return data.id
}
