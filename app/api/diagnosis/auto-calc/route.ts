import { NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { calculateZodiacSign } from '@/lib/diagnostics/zodiac';
import { calculate60Animal } from '@/lib/diagnostics/animal';
import { calculateSixStar } from '@/lib/diagnostics/six-star';
import { getSupabaseClient } from '@/utils/supabase/client';

const bodySchema = z.object({
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付は YYYY-MM-DD 形式で指定してください'),
});

export interface AutoCalcResponse {
  success: boolean;
  result?: {
    zodiacSign: string;
    animalType: string;
    animalCharacter: string;
    sixStar: string;
  };
  error?: string;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<AutoCalcResponse>(
      { success: false, error: 'リクエストの解析に失敗しました' },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<AutoCalcResponse>(
      { success: false, error: '不正なリクエストです' },
      { status: 400 },
    );
  }

  const [yearStr, monthStr, dayStr] = parsed.data.birth_date.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (year < 1930 || year > 2030) {
    return NextResponse.json<AutoCalcResponse>(
      { success: false, error: '対応年度は 1930〜2030 年です' },
      { status: 422 },
    );
  }

  const testDate = new Date(year, month - 1, day);
  if (
    testDate.getFullYear() !== year ||
    testDate.getMonth() !== month - 1 ||
    testDate.getDate() !== day
  ) {
    return NextResponse.json<AutoCalcResponse>(
      { success: false, error: '存在しない日付です' },
      { status: 422 },
    );
  }

  let zodiacSign: string;
  let animalType: string;
  let animalCharacter: string;
  let sixStar: string;

  try {
    zodiacSign = calculateZodiacSign(month, day);
    const animal = calculate60Animal(year, month, day);
    animalType = animal.animalType;
    animalCharacter = animal.animalCharacter;
    sixStar = calculateSixStar(year, month, day);
  } catch (err) {
    console.error('Diagnosis calculation error:', err);
    return NextResponse.json<AutoCalcResponse>(
      { success: false, error: '診断の算出に失敗しました' },
      { status: 500 },
    );
  }

  try {
    const supabase = getSupabaseClient();
    const { error: dbError } = await supabase.from('diagnoses').insert({
      user_id: null,
      zodiac_sign: zodiacSign,
      animal_type: animalType,
      animal_character: animalCharacter,
      six_star: sixStar,
    });
    if (dbError) {
      console.error('Supabase insert error:', dbError);
    }
  } catch (err) {
    console.error('Supabase connection error:', err);
  }

  return NextResponse.json<AutoCalcResponse>({
    success: true,
    result: { zodiacSign, animalType, animalCharacter, sixStar },
  });
}
