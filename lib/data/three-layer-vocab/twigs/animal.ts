// 動物 60 葉ノード語彙コーパス (Q5b-1/2/3): 60 体 × 8 語 = 480 語
//
// 出典:
//   - docs/input/deep-research/動物キャラ分類語彙コーパス生成.md (Q5b-1, 前半30体)
//   - docs/input/deep-research/動物語彙コーパス後半30体作成.md (Q5b-2, 後半30体)
//   - docs/input/deep-research/動物キャラクター分類語彙コーパス補完.md (Q5b-3, 補完24体)
//   - docs/output/F3/animal-60-name-mapping.md (公式呼称マッピング)
//
// 公式 60 体の Single Source of Truth: lib/data/animal-characters.ts
// 完全一致 30 体 + 表記差分 6 体 (こあら→子守熊 / 持った→もった / 持つ→もつ / 良い→いい) + Q5b-3 補完 24 体
//
// drift test: lib/data/three-layer-vocab/twigs/__tests__/twigs.test.ts が
// twigs/animal.ts と animal-characters.ts の公式呼称・基本動物・ID の完全一致を強制する。

import { ANIMAL_60_CHARACTERS } from '@/lib/data/animal-characters'
import type { AnimalTwigEntry, AnimalVocabularyById } from './types'

type RawEntry = { term: string; source: string; semanticTag: string }

function make(officialId: number, raws: RawEntry[]): AnimalTwigEntry[] {
  const official = ANIMAL_60_CHARACTERS[officialId]
  if (!official) {
    throw new Error(`ANIMAL_60_CHARACTERS[${officialId}] is missing`)
  }
  return raws.map((r) => ({
    ...r,
    officialId,
    officialName: official.character,
    baseAnimal: official.baseAnimal,
  }))
}

export const ANIMAL_VOCABULARY: AnimalVocabularyById = {
  // ID 1: 長距離ランナーのチータ (Q5b-1 §4.1)
  1: make(1, [
    { term: '目標に対する揺るぎなき執念', source: '弦本 (2003), p.178', semanticTag: '認知特性' },
    { term: '困難に屈せぬ強固な意志', source: '弦本 (2003), p.180', semanticTag: '自己認知' },
    { term: '徹底した自律的計画遂行', source: 'ISDマニュアル, Vol.1', semanticTag: '行動傾向' },
    { term: '他人との妥協の完全拒絶', source: '能見 (1971), p.180', semanticTag: '対人関係' },
    { term: '自力で壁を突破する馬力', source: '弦本 (2012), p.112', semanticTag: '行動傾向' },
    { term: '行動力と継続の完全融合', source: '服部 (2012), p.76', semanticTag: '行動傾向' },
    { term: '孤立を省みぬ独断専行', source: '弦本 (2003), p.183', semanticTag: '意思決定' },
    { term: '高い水準への自己革新', source: 'ISDマニュアル, Vol.1', semanticTag: '自己認知' },
  ]),
  // ID 2: 社交家のたぬき (Q5b-2 §8.2)
  2: make(2, [
    { term: '実直でまっすぐな行動', source: '弦本 (2003), p.198', semanticTag: '行動特性' },
    { term: '鋭敏な状況分析と洞察', source: '弦本 (2012), p.72', semanticTag: '思考スタイル' },
    { term: '自分の役割に徹する戦略性', source: 'ISDマニュアル', semanticTag: '行動特性' },
    { term: '誰にでも話を合わせる社交性', source: '能見 (1971), p.115', semanticTag: '対人態度' },
    { term: '信頼を呼ぶ誠実な気配り', source: '能見系派生資料', semanticTag: '対人態度' },
    { term: '経験に根ざした現実的理想', source: '弦本 (2012), p.74', semanticTag: '心理的原動力' },
    { term: '面倒見の良い人間関係', source: '弦本 (2003), p.199', semanticTag: '対人関係' },
    { term: 'つきあいの浅い人への小言', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 3: 落ち着きのない猿 (Q5b-1 §3.1)
  3: make(3, [
    { term: '電光石火の行動開始', source: '弦本 (2003), p.128', semanticTag: '行動傾向' },
    { term: '機転の利いた即興対応', source: '弦本 (2003), p.130', semanticTag: '意思決定' },
    { term: 'じっとしていられぬ焦燥', source: '能見 (1971), p.150', semanticTag: '自己認知' },
    { term: '遊び心を交えた問題解決', source: 'ISDマニュアル, Vol.1', semanticTag: '認知特性' },
    { term: '表面的理解での見切り発車', source: '弦本 (2012), p.72', semanticTag: '意思決定' },
    { term: '好奇心の多方的発露', source: '服部 (2012), p.61', semanticTag: '認知特性' },
    { term: '愛嬌ある軽快な社交術', source: '弦本 (2003), p.133', semanticTag: '対人関係' },
    { term: '成果を素早く刈り取る勘', source: 'ISDマニュアル, Vol.1', semanticTag: '認知特性' },
  ]),
  // ID 4: フットワークの軽い子守熊 (Q5b-2 §9.1, こあら→子守熊 正規化)
  4: make(4, [
    { term: '長期計画を着実に描く視点', source: '弦本 (2003), p.211', semanticTag: '思考スタイル' },
    { term: '夢を現実化する実行力', source: '弦本 (2012), p.98', semanticTag: '実務能力' },
    { term: '気配り上手なサポート姿勢', source: 'ISDマニュアル', semanticTag: '社会的役割' },
    { term: '相手を尊重する知的距離', source: '能見 (1971), p.132', semanticTag: '対人関係' },
    { term: '動きながら考えるせっかち', source: '能見系派生資料', semanticTag: '行動特性' },
    { term: '屈託のないさっぱりした快活', source: '弦本 (2012), p.101', semanticTag: 'パーソナリティ' },
    { term: '抜群の勘と本質の見破り', source: '弦本 (2003), p.212', semanticTag: '認知特性' },
    { term: '焦りから陥る極端な思考', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 5: 面倒見のいい黒ひょう (Q5b-1 §5.1, 良い→いい 正規化)
  5: make(5, [
    { term: '後輩を見放さない温厚な擁護', source: '弦本 (2003), p.228', semanticTag: '対人関係' },
    { term: '丁寧で洗練された気配り', source: '弦本 (2003), p.230', semanticTag: '対人関係' },
    { term: '他者の幸福のための奔走', source: '能見 (1971), p.210', semanticTag: '行動傾向' },
    { term: 'お節介がもたらす煙たさ', source: 'ISDマニュアル, Vol.1', semanticTag: '対人関係' },
    { term: '深い共感に基づく対話調整', source: '弦本 (2012), p.154', semanticTag: '意思決定' },
    { term: '親しみやすく上品な振る舞い', source: '服部 (2012), p.91', semanticTag: '自己認知' },
    { term: '依存を放置することへの不満', source: '弦本 (2003), p.233', semanticTag: '自己防衛' },
    { term: '義理人情を重んじる信頼感', source: 'ISDマニュアル, Vol.1', semanticTag: '対人関係' },
  ]),
  // ID 6: 愛情あふれる虎 (Q5b-2 §7.1)
  6: make(6, [
    { term: '飾り気のない人間味', source: '弦本 (2003), p.180', semanticTag: 'パーソナリティ' },
    { term: '万人に注ぐ温かい眼差し', source: '能見系派生資料', semanticTag: '対人態度' },
    { term: '弱者擁護の親分肌', source: '弦本 (2012), p.42', semanticTag: '社会的役割' },
    { term: '嘘偽りのない実直な対応', source: '能見 (1971), p.92', semanticTag: '意思疎通' },
    { term: '破綻を避ける最短突破', source: '弦本 (2003), p.181', semanticTag: '実務能力' },
    { term: '頼られ支える支援行動', source: '弦本 (2012), p.43', semanticTag: '行動特性' },
    { term: '自説を曲げぬ確固たる芯', source: 'ISDマニュアル', semanticTag: '心理的原動力' },
    { term: '独善からくるキツイ一言', source: '弦本 (2003), p.182', semanticTag: '失敗パターン' },
  ]),
  // ID 7: 全力疾走するチータ (Q5b-1 §4.2)
  7: make(7, [
    { term: '瞬時の衝動による即応', source: '弦本 (2003), p.188', semanticTag: '意思決定' },
    { term: '失敗を忘れる無制限の楽観', source: '弦本 (2003), p.190', semanticTag: '認知特性' },
    { term: '圧倒的なスタートダッシュ', source: '能見 (1971), p.185', semanticTag: '行動傾向' },
    { term: '飽きた瞬間の急激な放置', source: 'ISDマニュアル, Vol.1', semanticTag: '行動傾向' },
    { term: '情熱の急進的燃焼', source: '弦本 (2012), p.120', semanticTag: '認知特性' },
    { term: '束縛を嫌う行動の自由', source: '服部 (2012), p.79', semanticTag: '自己防衛' },
    { term: '地道なプロセスへの極度の嫌悪', source: '弦本 (2003), p.193', semanticTag: '行動傾向' },
    { term: '欲しい物への執着と行動', source: 'ISDマニュアル, Vol.1', semanticTag: '自己防衛' },
  ]),
  // ID 8: 磨き上げられたたぬき (Q5b-2 §8.3)
  8: make(8, [
    { term: '洗練された知的な佇まい', source: '弦本 (2003), p.201', semanticTag: 'パーソナリティ' },
    { term: '秩序とルールを守る完璧主義', source: '弦本 (2012), p.78', semanticTag: '行動規範' },
    { term: '着実な目標への実行力', source: 'ISDマニュアル', semanticTag: '実務能力' },
    { term: '相手を立てる度量の大きさ', source: '能見 (1971), p.118', semanticTag: '対人態度' },
    { term: '伝統や老舗を愛好する古風', source: '能見系派生資料', semanticTag: '価値基準' },
    { term: '細い関係を永く保つ丁寧さ', source: '弦本 (2012), p.81', semanticTag: '対人関係' },
    { term: '美意識に基づく高い気品', source: '弦本 (2003), p.202', semanticTag: '心理的原動力' },
    { term: 'ストイックに耐えて突然自滅', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 9: 大きな志をもった猿 (Q5b-1 §3.2, 持った→もった 正規化)
  9: make(9, [
    { term: '将来への高邁な理想設計', source: '弦本 (2003), p.138', semanticTag: '認知特性' },
    { term: '実利を狙う緻密な計算', source: '弦本 (2003), p.140', semanticTag: '意思決定' },
    { term: '上を目指す貪欲な習得欲', source: 'ISDマニュアル, Vol.1', semanticTag: '自己認知' },
    { term: '人脈を活用する上昇志向', source: '能見 (1971), p.155', semanticTag: '対人関係' },
    { term: '目先の派手さへの偏重', source: '弦本 (2012), p.81', semanticTag: '行動傾向' },
    { term: '自信過剰による計画の肥大', source: '服部 (2012), p.64', semanticTag: '意思決定' },
    { term: '現実的な利益への目配り', source: '弦本 (2003), p.143', semanticTag: '認知特性' },
    { term: '組織の発展を導く構想力', source: 'ISDマニュアル, Vol.1', semanticTag: '認知特性' },
  ]),
  // ID 10: 母性豊かな子守熊 (Q5b-2 §9.2, こあら→子守熊 正規化)
  10: make(10, [
    { term: '周囲を包み込む潤いと温厚', source: '弦本 (2003), p.214', semanticTag: 'パーソナリティ' },
    { term: '長期ビジョンによる着実歩み', source: '弦本 (2012), p.104', semanticTag: '思考スタイル' },
    { term: '抜群の処理スピードと能率', source: 'ISDマニュアル', semanticTag: '実務能力' },
    { term: '臨機応変な即断即決行動', source: '能見 (1971), p.135', semanticTag: '行動特性' },
    { term: '夢を語り合うロマンティスト', source: '能見系派生資料', semanticTag: '認知特性' },
    { term: '指導者を活かして掴む成功', source: '弦本 (2012), p.106', semanticTag: '行動特性' },
    { term: '相手の心を救う細かなお世話', source: '弦本 (2003), p.215', semanticTag: '対人態度' },
    { term: '陰と陽の激しい感情起伏', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 11: 正直なこじか (Q5b-3 #1)
  11: make(11, [
    { term: '嘘やごまかしの完全拒絶', source: '弦本 (2003), p.102', semanticTag: '倫理的価値観' },
    { term: '飾らない素朴な一本気', source: '能見 (1971), p.44', semanticTag: '基本資質' },
    { term: 'ピュアなハートの情熱', source: '弦本 (2003), p.103', semanticTag: '基本資質' },
    { term: '初対面で見せる強い警戒', source: 'ISDマニュアル各種', semanticTag: '対人関係' },
    { term: '内面からの深い本音志向', source: '弦本 (2012), p.56', semanticTag: '心理的欲求' },
    { term: '義理人情を貫く厚い義侠', source: '能見 (1971), p.46', semanticTag: '社会的態度' },
    { term: '依存を伴う寂しがり屋', source: '服部 (2012), p.115', semanticTag: '対人関係' },
    { term: '融通の利かない頑固な硬直', source: '弦本 (2003), p.104', semanticTag: '行動特性' },
  ]),
  // ID 12: 人気者のゾウ (Q5b-3 #17)
  12: make(12, [
    { term: '他人に依存しない完璧な独立自立', source: '弦本 (2003), p.238', semanticTag: '心理的特性' },
    { term: 'やると決めた約束を完遂する意志', source: 'ISDマニュアル各種', semanticTag: '意思決定' },
    { term: '周囲に惜しみなく注ぐ厚い人情', source: '能見 (1971), p.125', semanticTag: '対人関係' },
    { term: '摩擦や対立を穏やかに回避する力', source: '弦本 (2012), p.138', semanticTag: '社会的技能' },
    { term: 'ごく一部の親しい者にだけ見せる本', source: '服部 (2012), p.172', semanticTag: '対人関係' },
    { term: '陰で行う妥協の一切ない地道な努力', source: 'ISDマニュアル各種', semanticTag: '実行能力' },
    { term: '周囲に安心感を与える確固たる風格', source: '弦本 (2003), p.239', semanticTag: '影響力' },
    { term: '自分の限界を他人に明かせない頑迷', source: '能見 (1971), p.127', semanticTag: '行動特性' },
  ]),
  // ID 13: ネアカの狼 (Q5b-1 §1.5)
  13: make(13, [
    { term: '裏表のない純粋な態度', source: '弦本 (2003), p.78', semanticTag: '対人関係' },
    { term: '卓越した機転と世渡り', source: '弦本 (2003), p.79', semanticTag: '認知特性' },
    { term: '曲がったことを嫌う正義', source: '能見 (1971), p.115', semanticTag: '自己認知' },
    { term: '独自の絶対的ナンバーワン', source: '弦本 (2003), p.81', semanticTag: '自己認知' },
    { term: '得意分野への偏執的没頭', source: 'ISDマニュアル, Vol.1', semanticTag: '認知特性' },
    { term: '頑固な自己納得の要求', source: '弦本 (2012), p.35', semanticTag: '意思決定' },
    { term: '開放的な外面と高い防壁', source: '服部 (2012), p.43', semanticTag: '自己防衛' },
    { term: '言葉足らずによる誤解', source: 'ISDマニュアル, Vol.1', semanticTag: '対人関係' },
  ]),
  // ID 14: 協調性のないひつじ (Q5b-3 #8)
  14: make(14, [
    { term: 'リスクを徹底排除する周到計画', source: '弦本 (2003), p.166', semanticTag: '計画管理' },
    { term: 'ロジカルに物事を伝える伝達力', source: 'ISDマニュアル各種', semanticTag: 'コミュニケーション' },
    { term: '他者に流されない強固な自律志向', source: '能見 (1971), p.80', semanticTag: '意思決定' },
    { term: '粘り強く地道に取り組む継続性', source: '弦本 (2012), p.88', semanticTag: '実行能力' },
    { term: '高い自尊心と安易に群れない壁', source: '服部 (2012), p.139', semanticTag: '自己認知' },
    { term: 'コツコツと地道に蓄財する手堅さ', source: 'ISDマニュアル各種', semanticTag: '資源管理' },
    { term: 'トラブルを未然に防ぐ鋭い警戒', source: '弦本 (2003), p.167', semanticTag: '心理的特性' },
    { term: 'スケジュール崩壊時の強固な拒絶', source: '能見 (1971), p.82', semanticTag: '行動特性' },
  ]),
  // ID 15: どっしりとした猿 (Q5b-1 §3.4)
  15: make(15, [
    { term: '揺るぎない確固たる貫禄', source: '弦本 (2003), p.158', semanticTag: '自己認知' },
    { term: '冷静沈着な状況査定', source: '弦本 (2003), p.160', semanticTag: '認知特性' },
    { term: '自身の経験への絶対的信頼', source: 'ISDマニュアル, Vol.1', semanticTag: '自己認知' },
    { term: '他者の進言に対する拒絶', source: '能見 (1971), p.168', semanticTag: '対人関係' },
    { term: '責任を背負い込む重厚さ', source: '弦本 (2012), p.96', semanticTag: '行動傾向' },
    { term: '実利を逃さぬ堅実な計画', source: '服部 (2012), p.70', semanticTag: '意思決定' },
    { term: '融通の利かぬ意志の硬直', source: '弦本 (2003), p.163', semanticTag: '意思決定' },
    { term: '長期的な地盤の確立', source: 'ISDマニュアル, Vol.1', semanticTag: '行動傾向' },
  ]),
  // ID 16: コアラのなかの子守熊 (Q5b-3 #12)
  16: make(16, [
    { term: '夢の実現に向けた徹底的な自己研', source: '弦本 (2003), p.198', semanticTag: '自己開発' },
    { term: '勝利を毟り取る強烈な競争意識', source: 'ISDマニュアル各種', semanticTag: '競争行動' },
    { term: '困難を努力で乗り越える突破力', source: '能見 (1971), p.100', semanticTag: '実行能力' },
    { term: '長期的な損得を見極める合理性', source: '弦本 (2012), p.108', semanticTag: '認知スタイル' },
    { term: '周囲に弱みを見せないストイック', source: '服部 (2012), p.152', semanticTag: '心理的特性' },
    { term: '抜群の若々しさと強固な向上心', source: 'ISDマニュアル各種', semanticTag: '自己認知' },
    { term: '他者と適切な関係を築く社交力', source: '弦本 (2003), p.199', semanticTag: '対人関係' },
    { term: '敗北を絶対に認めない過剰な執着', source: '能見 (1971), p.102', semanticTag: '行動特性' },
  ]),
  // ID 17: 強い意志をもったこじか (Q5b-3 #2)
  17: make(17, [
    { term: '曲げない確固たる信念', source: '弦本 (2003), p.112', semanticTag: '意思決定' },
    { term: '任された責任の完遂力', source: 'ISDマニュアル各種', semanticTag: '実行能力' },
    { term: '社会的秩序や礼儀の徹底', source: '能見 (1971), p.49', semanticTag: '組織規律' },
    { term: '周囲へ配慮する深い慈愛', source: '弦本 (2003), p.113', semanticTag: '対人態度' },
    { term: '他者に打ち解けない慎重', source: '服部 (2012), p.118', semanticTag: '行動特性' },
    { term: '摩擦を避ける平和的調和', source: '弦本 (2012), p.60', semanticTag: '対人関係' },
    { term: '内面に秘める強固な自己規律', source: '能見 (1971), p.51', semanticTag: '基本資質' },
    { term: '礼儀にうるさい過度の厳格', source: '弦本 (2003), p.114', semanticTag: '行動特性' },
  ]),
  // ID 18: デリケートなゾウ (Q5b-2 §10.1)
  18: make(18, [
    { term: '冷静沈着なリスク回避思考', source: '弦本 (2003), p.226', semanticTag: '思考スタイル' },
    { term: '人の見ない場での徹底努力', source: '弦本 (2012), p.128', semanticTag: '行動特性' },
    { term: '筋の通らないことを嫌う正義', source: 'ISDマニュアル', semanticTag: '価値基準' },
    { term: '地道な実績の着実な蓄積', source: '能見 (1971), p.150', semanticTag: '実務能力' },
    { term: '妥協なき一途のプロ意識', source: '能見系派生資料', semanticTag: '自我精神' },
    { term: '正々堂々と悪を正す支援', source: '弦本 (2012), p.131', semanticTag: '社会的役割' },
    { term: '倹約に徹する計画的支出', source: '弦本 (2003), p.227', semanticTag: '経済活動' },
    { term: '弱音を吐けぬガミガミ激怒', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 19: 放浪の狼 (Q5b-3 #4)
  19: make(19, [
    { term: '世間に媚びない潔い自律', source: '弦本 (2003), p.134', semanticTag: '心理的特性' },
    { term: '変化を求めて移ろう移動性', source: 'ISDマニュアル各種', semanticTag: '行動傾向' },
    { term: '自分独自の生き方の追及', source: '能見 (1971), p.60', semanticTag: '自己認識' },
    { term: '初対面を拒む高い心理障壁', source: '服部 (2012), p.125', semanticTag: '対人防衛' },
    { term: '困窮者を支えるお人好し性質', source: '弦本 (2012), p.70', semanticTag: '社会的態度' },
    { term: '多様な実体験による自己成長', source: 'ISDマニュアル各種', semanticTag: '学習特性' },
    { term: '臨機応変なトラブル即応性', source: '弦本 (2003), p.135', semanticTag: '環境順応' },
    { term: '継続が苦手な極度の飽き性', source: '能見 (1971), p.62', semanticTag: '行動特性' },
  ]),
  // ID 20: 物静かなひつじ (Q5b-2 §11.2)
  20: make(20, [
    { term: '安全第一を崩さないおとなしさ', source: '弦本 (2003), p.244', semanticTag: '行動特性' },
    { term: '人の意見を逆らわずに受け入れる', source: '弦本 (2012), p.168', semanticTag: '対人態度' },
    { term: '客観的に判断できる高い視野', source: 'ISDマニュアル', semanticTag: '思考スタイル' },
    { term: '親切にお世話を焼く人当たり', source: '能見 (1971), p.174', semanticTag: '対人態度' },
    { term: 'ミスのない慎重な下調べの完遂', source: '能見系派生資料', semanticTag: '実務能力' },
    { term: '名アドバイザーとしての助言', source: '弦本 (2012), p.170', semanticTag: '社会的役割' },
    { term: 'コツコツ貯蓄する高い金銭管理', source: '弦本 (2003), p.245', semanticTag: '経済活動' },
    { term: '気分でコロコロ変わる不一貫', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 21: 落ち着きのあるペガサス (Q5b-2 §12.1)
  21: make(21, [
    { term: '穏やかながら知的な物腰の魅力', source: '弦本 (2003), p.256', semanticTag: 'パーソナリティ' },
    { term: '伸び伸びとした自由を愛する', source: '弦本 (2012), p.194', semanticTag: '価値基準' },
    { term: '斬新な発想を生む新しいアイデア', source: 'ISDマニュアル', semanticTag: '思考スタイル' },
    { term: '本心を悟らせない愛想の良い振る舞い', source: '能見 (1971), p.190', semanticTag: '対人態度' },
    { term: '個人プレーで大成功を掴む才能', source: '能見系派生資料', semanticTag: '実務能力' },
    { term: '鋭い感性で成長を願い続ける', source: '弦本 (2012), p.196', semanticTag: '心理的原動力' },
    { term: '周囲の支えに感謝を忘れない', source: '弦本 (2003), p.257', semanticTag: '対人態度' },
    { term: 'おだてに弱く騙される脆さ', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 22: 強靭な翼をもつペガサス (Q5b-2 §12.3, 持つ→もつ 正規化)
  22: make(22, [
    { term: '面倒見の良い親分肌の気配り', source: '弦本 (2003), p.262', semanticTag: '社会的役割' },
    { term: '理想を追いかけるしなやかな情熱', source: '弦本 (2012), p.208', semanticTag: '心理的原動力' },
    { term: '冷静な計算と知性を秘めた駆け引き', source: 'ISDマニュアル', semanticTag: '思考スタイル' },
    { term: '相手の出方に合わせる臨機応変', source: '能見 (1971), p.198', semanticTag: '行動特性' },
    { term: '豊富な人脈を築き上げる社交', source: '能見系派生資料', semanticTag: '対人関係' },
    { term: '完成するまで脇目も振らぬ集中', source: '弦本 (2012), p.210', semanticTag: 'タスク管理' },
    { term: '自らの信じる道をがむしゃらに進む', source: '弦本 (2003), p.263', semanticTag: '行動特性' },
    { term: '完成直後の完全な興味喪失', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 23: 無邪気なひつじ (Q5b-3 #9)
  23: make(23, [
    { term: 'どんな場にも即時に馴染む順応力', source: '弦本 (2003), p.174', semanticTag: '環境順応' },
    { term: '仲間のために細かく尽くす気配り', source: 'ISDマニュアル各種', semanticTag: '対人配慮' },
    { term: '調和を保つための優れた順従性', source: '能見 (1971), p.85', semanticTag: '対人関係' },
    { term: '敵を作らない無邪気な愛嬌', source: '弦本 (2012), p.92', semanticTag: '社会的技能' },
    { term: '心地よい居場所を構築する社交性', source: '服部 (2012), p.142', semanticTag: '心理的欲求' },
    { term: '新しいことへ挑戦する旺盛な好奇', source: 'ISDマニュアル各種', semanticTag: '学習特性' },
    { term: '陰日向なく周囲を支えるサポート力', source: '弦本 (2003), p.175', semanticTag: '組織役割' },
    { term: '理想が高すぎるための過剰な甘え', source: '能見 (1971), p.87', semanticTag: '行動特性' },
  ]),
  // ID 24: クリエイティブな狼 (Q5b-3 #5)
  24: make(24, [
    { term: '非常に優れた素早い習得力', source: '弦本 (2003), p.142', semanticTag: '認知能力' },
    { term: '干渉を許さない徹底した防衛', source: 'ISDマニュアル各種', semanticTag: '対人防衛' },
    { term: '自己流ナンバーワンへの執念', source: '能見 (1971), p.65', semanticTag: '自己認識' },
    { term: '知的探求を支える高い自負', source: '弦本 (2012), p.73', semanticTag: '心理的特性' },
    { term: '自らの確信に従う直進行動', source: '服部 (2012), p.128', semanticTag: '意思決定' },
    { term: '孤独な思索が生む独自の視点', source: 'ISDマニュアル各種', semanticTag: '創造性' },
    { term: '他人に流されない絶対的自軸', source: '弦本 (2003), p.143', semanticTag: '基本資質' },
    { term: '融通が利かない過度の独善', source: '能見 (1971), p.67', semanticTag: '行動特性' },
  ]),
  // ID 25: 穏やかな狼 (Q5b-1 §1.3)
  25: make(25, [
    { term: '物静かな自己充足', source: '弦本 (2003), p.64', semanticTag: '自己認知' },
    { term: '平和主義的距離感', source: '弦本 (2003), p.65', semanticTag: '対人関係' },
    { term: '静的な自己ペース維持', source: 'ISDマニュアル, Vol.1', semanticTag: '自己防衛' },
    { term: '変化への緩慢な適応', source: '能見 (1971), p.108', semanticTag: '行動傾向' },
    { term: '穏やかな不言実行', source: '弦本 (2012), p.24', semanticTag: '行動傾向' },
    { term: '干渉を嫌う静かな反発', source: '弦本 (2003), p.67', semanticTag: '自己防衛' },
    { term: '着実な単独作業遂行', source: '服部 (2012), p.38', semanticTag: '行動傾向' },
    { term: '安定した情緒の自制', source: 'ISDマニュアル, Vol.1', semanticTag: '認知特性' },
  ]),
  // ID 26: 粘り強いひつじ (Q5b-3 #10)
  26: make(26, [
    { term: '幻想を排して事実を見る現実主義', source: '弦本 (2003), p.182', semanticTag: '認知スタイル' },
    { term: '逆境に屈せず一途に完遂する粘り', source: 'ISDマニュアル各種', semanticTag: '実行能力' },
    { term: '他者のために損を厭わない奉仕心', source: '能見 (1971), p.90', semanticTag: '社会的奉仕' },
    { term: '温かい配慮に満ちた対人態度', source: '弦本 (2012), p.96', semanticTag: '対人関係' },
    { term: 'コツコツと着実に貯蓄する手堅さ', source: '服部 (2012), p.145', semanticTag: '資源管理' },
    { term: '約束や納期を厳守する高い誠実性', source: 'ISDマニュアル各種', semanticTag: '信頼構築' },
    { term: '頼られた役割を完遂する責任感', source: '弦本 (2003), p.183', semanticTag: '基本資質' },
    { term: '他人の課題まで抱え込む過剰犠牲', source: '能見 (1971), p.92', semanticTag: '行動特性' },
  ]),
  // ID 27: 波乱に満ちたペガサス (Q5b-2 §12.4)
  27: make(27, [
    { term: '親しみと近寄りがたさの同居', source: '弦本 (2003), p.265', semanticTag: 'パーソナリティ' },
    { term: 'ジェット機のごとき迅速な解決', source: '弦本 (2012), p.214', semanticTag: '実務能力' },
    { term: '巧みな話術で人心を捉える', source: 'ISDマニュアル', semanticTag: '意思疎通' },
    { term: '人を見抜く鋭い野生の勘', source: '能見 (1971), p.201', semanticTag: '認知特性' },
    { term: '細かい所に目を光らせる理論処理', source: '能見系派生資料', semanticTag: '思考スタイル' },
    { term: '同情心に厚く他者を気遣う', source: '弦本 (2012), p.216', semanticTag: '対人態度' },
    { term: '組織に縛られない臨機応変な良好関係', source: '弦本 (2003), p.266', semanticTag: '対人関係' },
    { term: '面倒な締め付けによる即時放棄', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 28: 優雅なペガサス (Q5b-2 §12.5)
  28: make(28, [
    { term: '竹を割ったような一本気の素直さ', source: '弦本 (2003), p.268', semanticTag: 'パーソナリティ' },
    { term: '卑怯なことを嫌う強い正義感', source: '弦本 (2012), p.220', semanticTag: '行動規範' },
    { term: '他人の苦労まで背ない込む温かさ', source: 'ISDマニュアル', semanticTag: '対人態度' },
    { term: '正直すぎて要領よく振る舞えない', source: '能見 (1971), p.205', semanticTag: '行動特性' },
    { term: '情にもろくポロッと涙を流す', source: '能見系派生資料', semanticTag: 'パーソナリティ' },
    { term: '独自の美意識に基づき完璧に仕上げる', source: '弦本 (2012), p.222', semanticTag: '実務能力' },
    { term: '放っておいても人の輪の中心に立つ', source: '弦本 (2003), p.269', semanticTag: '対人関係' },
    { term: '単調な繰り返しによる即座の飽き', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 29: チャレンジ精神旺盛なひつじ (Q5b-3 #11)
  29: make(29, [
    { term: '緻密な計画に裏打ちされた決断力', source: '弦本 (2003), p.190', semanticTag: '意思決定' },
    { term: '弱者や年下を力強く導く先導力', source: 'ISDマニュアル各種', semanticTag: '組織統率' },
    { term: '目標に向け地道に進む一途な強さ', source: '能見 (1971), p.95', semanticTag: '実行能力' },
    { term: '他者のお世話を積極的に焼く親切', source: '弦本 (2012), p.102', semanticTag: '対人関係' },
    { term: '自らの信念をブレずに守り抜く芯', source: '服部 (2012), p.149', semanticTag: '心理的特性' },
    { term: '組織を崩壊から守る強い責任感', source: 'ISDマニュアル各種', semanticTag: '信頼構築' },
    { term: '他者から深く愛される温かい人望', source: '弦本 (2003), p.191', semanticTag: '影響力' },
    { term: '慎重すぎるための行動開始の遅滞', source: '能見 (1971), p.97', semanticTag: '行動特性' },
  ]),
  // ID 30: 順応性のある狼 (Q5b-3 #6)
  30: make(30, [
    { term: '場を活気づける驚異の親和性', source: '弦本 (2003), p.150', semanticTag: '対人影響' },
    { term: 'どんな環境にも馴染む柔軟適応', source: 'ISDマニュアル各種', semanticTag: '環境順応' },
    { term: '損得を排した献身的な他者支援', source: '能見 (1971), p.70', semanticTag: '社会的奉仕' },
    { term: '密着を拒む一定の対人距離維持', source: '弦本 (2012), p.78', semanticTag: '対人関係' },
    { term: '孤立を恐れない自立的な内面', source: '服部 (2012), p.132', semanticTag: '心理的特性' },
    { term: '周囲の期待に応える誠実な行動', source: 'ISDマニュアル各種', semanticTag: '信頼構築' },
    { term: '他人に弱みを見せない完結欲求', source: '弦本 (2003), p.151', semanticTag: '対人態度' },
    { term: '自力解決への執着による孤立', source: '能見 (1971), p.72', semanticTag: '行動特性' },
  ]),
  // ID 31: リーダーとなるゾウ (Q5b-2 §10.2)
  31: make(31, [
    { term: '一生懸命に打ち込む熱意', source: '弦本 (2003), p.229', semanticTag: '心理的原動力' },
    { term: '妥協なき根性の徹底発揮', source: '弦本 (2012), p.136', semanticTag: '行動特性' },
    { term: '迅速な決断と素早い行動力', source: 'ISDマニュアル', semanticTag: '実務能力' },
    { term: '周囲を巻き込むリーダー実力', source: '能見 (1971), p.154', semanticTag: '社会的役割' },
    { term: '怠けや甘えを嫌う頑固さ', source: '能見系派生資料', semanticTag: '行動規範' },
    { term: '純粋な着実行動による信頼', source: '弦本 (2012), p.138', semanticTag: '社会的信用' },
    { term: '他人に喜ばれる奉仕活動', source: '弦本 (2003), p.230', semanticTag: '対人態度' },
    { term: '荒い口調で強いる妥協拒否', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 32: しっかり者のこじか (Q5b-1 §2.1)
  32: make(32, [
    { term: 'おっとりした調和の形成', source: '弦本 (2003), p.86', semanticTag: '対人関係' },
    { term: '秘書的な人間関係サポート', source: '弦本 (2003), p.88', semanticTag: '行動傾向' },
    { term: '頼み事を断れぬお人好し', source: 'ISDマニュアル, Vol.1', semanticTag: '対人関係' },
    { term: '愛され上手な甘えの技術', source: '能見 (1971), p.122', semanticTag: '自己防衛' },
    { term: '独自の空想的世界観', source: '弦本 (2012), p.42', semanticTag: '認知特性' },
    { term: '体育会系競争への拒絶', source: '服部 (2012), p.46', semanticTag: '自己防衛' },
    { term: '警戒心の強い緩慢な進展', source: '弦本 (2003), p.90', semanticTag: '意思決定' },
    { term: '義理堅い誠実な約束', source: 'ISDマニュアル, Vol.1', semanticTag: '行動傾向' },
  ]),
  // ID 33: 活動的な子守熊 (Q5b-2 §9.5, こあら→子守熊 正規化)
  33: make(33, [
    { term: 'バイタリティ溢れる勝負師', source: '弦本 (2003), p.223', semanticTag: 'パーソナリティ' },
    { term: '誰とでも臆せず話す会話力', source: '弦本 (2012), p.122', semanticTag: '意思疎通' },
    { term: '利益に向けた冷徹な最短突破', source: 'ISDマニュアル', semanticTag: '行動特性' },
    { term: '自力でやり通す圧倒的ガッツ', source: '能見 (1971), p.146', semanticTag: '実務能力' },
    { term: '涙もろく情の厚いお人好し', source: '能見系派生資料', semanticTag: '対人関係' },
    { term: '冷静沈着なイレギュラー判断', source: '弦本 (2012), p.124', semanticTag: '思考スタイル' },
    { term: '意表を突くほど大胆な進撃', source: '弦本 (2003), p.224', semanticTag: '行動特性' },
    { term: '打算的すぎる急進の衝突', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 34: 気分屋の猿 (Q5b-3 #15)
  34: make(34, [
    { term: '瞬間的なひらめきを活かす高度知', source: '弦本 (2003), p.222', semanticTag: '認知能力' },
    { term: 'アクシデントを楽しむ不屈の遊び心', source: 'ISDマニュアル各種', semanticTag: '心理的特性' },
    { term: '変化に臨機応変に対応する器用さ', source: '能見 (1971), p.115', semanticTag: '環境順応' },
    { term: '機知に富んだ洗練されたユーモア', source: '弦本 (2012), p.126', semanticTag: 'コミュニケーション' },
    { term: '時間をかけて信頼を深める慎重さ', source: '服部 (2012), p.164', semanticTag: '対人関係' },
    { term: '嘘を嫌い本音を重視する真っ直ぐ', source: 'ISDマニュアル各種', semanticTag: 'パーソナリティ' },
    { term: '固定観念に縛られない自由な創造', source: '弦本 (2003), p.223', semanticTag: '創造性' },
    { term: 'その場の思いつきで動く計画の欠如', source: '能見 (1971), p.117', semanticTag: '行動特性' },
  ]),
  // ID 35: 頼られると嬉しいひつじ (Q5b-2 §11.5)
  35: make(35, [
    { term: '社会に貢献する情熱的ボランティア', source: '弦本 (2003), p.253', semanticTag: '行動規範' },
    { term: '義理人情に厚い真面目な正義感', source: '弦本 (2012), p.188', semanticTag: '価値基準' },
    { term: '最後までやり抜く粘り強い闘志', source: 'ISDマニュアル', semanticTag: '行動特性' },
    { term: 'トラブルも冷静に対処する俯瞰視野', source: '能見 (1971), p.186', semanticTag: '思考スタイル' },
    { term: '相手を乗せてまとめあげる才能', source: '能見系派生資料', semanticTag: '意思疎通' },
    { term: '感謝されることに最高の喜びを抱く', source: '弦本 (2012), p.190', semanticTag: '心理的原動力' },
    { term: '内面に強烈な自尊心を秘める', source: '弦本 (2003), p.254', semanticTag: '自我精神' },
    { term: '断れずに抱え込む安請け合い', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 36: 好感のもたれる狼 (Q5b-3 #7)
  36: make(36, [
    { term: '人々の心理を察する優れた共感', source: '弦本 (2003), p.158', semanticTag: '感情認識' },
    { term: '周囲を和ませる抜群のユーモア', source: 'ISDマニュアル各種', semanticTag: 'コミュニケーション' },
    { term: '嘘や裏表のまったくない素直さ', source: '能見 (1971), p.75', semanticTag: 'パーソナリティ' },
    { term: '一度関わった他者への厚い情義', source: '弦本 (2012), p.82', semanticTag: '対人関係' },
    { term: '誠実を尽くす温かい人間関係', source: '服部 (2012), p.135', semanticTag: '信頼構築' },
    { term: '期待される言葉の適確な提供', source: 'ISDマニュアル各種', semanticTag: '社会的技能' },
    { term: '対立を避けるスマートな配慮力', source: '弦本 (2003), p.159', semanticTag: '対人関係' },
    { term: '情に引きずられ決断を誤る脆さ', source: '能見 (1971), p.77', semanticTag: '行動特性' },
  ]),
  // ID 37: まっしぐらに突き進むゾウ (Q5b-3 #18)
  37: make(37, [
    { term: '脇目も振らずに爆進する猪突猛進', source: '弦本 (2003), p.246', semanticTag: '行動傾向' },
    { term: '途中で投げ出さない絶対的な持続力', source: 'ISDマニュアル各種', semanticTag: '実行能力' },
    { term: '不屈の努力で逆境をねじ伏せる力', source: '能見 (1971), p.130', semanticTag: '基本資質' },
    { term: '細部まで抜かりなく仕上げる完璧主義', source: '弦本 (2012), p.144', semanticTag: '心理的特性' },
    { term: '強固な信念に支えられた行動の軸', source: '服部 (2012), p.176', semanticTag: '意思決定' },
    { term: '妥協を排して走り続ける高いエネルギー', source: 'ISDマニュアル各種', semanticTag: '基本資質' },
    { term: '目標の確実な奪取を目指す計画追従', source: '弦本 (2003), p.247', semanticTag: '計画管理' },
    { term: '周囲の制止を一切無視する独断専行', source: '能見 (1971), p.132', semanticTag: '行動特性' },
  ]),
  // ID 38: 華やかなこじか (Q5b-3 #3)
  38: make(38, [
    { term: '自らトレンドを創出する力', source: '弦本 (2003), p.122', semanticTag: '創造性' },
    { term: '独創的なカリスマ性', source: 'ISDマニュアル各種', semanticTag: '影響力' },
    { term: '妥協を排する強い自尊心', source: '能見 (1971), p.54', semanticTag: '自己認識' },
    { term: '確固たる独自の主体的芯', source: '弦本 (2012), p.65', semanticTag: '意思決定' },
    { term: '安易な融和を許さない気高さ', source: '服部 (2012), p.121', semanticTag: '対人関係' },
    { term: '内なる美学への強い確信', source: '弦本 (2003), p.123', semanticTag: '心理的特性' },
    { term: '外部への豊かな魅力的アピール', source: 'ISDマニュアル各種', semanticTag: '社会的態度' },
    { term: '他人を見下す冷淡な品評', source: '能見 (1971), p.56', semanticTag: '行動特性' },
  ]),
  // ID 39: 夢とロマンの子守熊 (Q5b-3 #13)
  39: make(39, [
    { term: '建前やお世辞を排した本音主義', source: '弦本 (2003), p.206', semanticTag: '倫理的価値観' },
    { term: '独自の壮大な構想を追求する信念', source: 'ISDマニュアル各種', semanticTag: '心理的特性' },
    { term: '周囲の他者に寄り添い尽くす誠実', source: '能見 (1971), p.105', semanticTag: '社会的関係' },
    { term: '嘘を極度に嫌う真っ直ぐな生き方', source: '弦本 (2012), p.114', semanticTag: 'パーソナリティ' },
    { term: '精神的な深い繋がりを尊ぶ人間性', source: '服部 (2012), p.156', semanticTag: '対人関係' },
    { term: '独自のビジョンを形にする長期計画', source: 'ISDマニュアル各種', semanticTag: '計画管理' },
    { term: '敵を作らない素直で温和な対人姿勢', source: '弦本 (2003), p.207', semanticTag: '対人態度' },
    { term: '理想的な展開を夢想する現実軽視', source: '能見 (1971), p.107', semanticTag: '行動特性' },
  ]),
  // ID 40: 尽す猿 (Q5b-3 #16)
  40: make(40, [
    { term: '他者の微細な欲求を察する直感力', source: '弦本 (2003), p.230', semanticTag: '感情認識' },
    { term: '他者のために全てを捧げる親切心', source: 'ISDマニュアル各種', semanticTag: '社会的奉仕' },
    { term: '他者とは異なる多角的な予測センス', source: '能見 (1971), p.120', semanticTag: '創造性' },
    { term: '感謝と承認を求める純粋な欲求', source: '弦本 (2012), p.132', semanticTag: '心理的欲求' },
    { term: '独自の領域をストイックに追求する', source: '服部 (2012), p.168', semanticTag: '基本資質' },
    { term: '集団の枠に縛られない自律的な道', source: 'ISDマニュアル各種', semanticTag: '行動特性' },
    { term: 'おだてられると底力を発揮する性', source: '弦本 (2003), p.231', semanticTag: '影響力' },
    { term: '自己犠牲の末に抱え込む多大ストレス', source: '能見 (1971), p.122', semanticTag: '行動特性' },
  ]),
  // ID 41: 大器晩成のたぬき (Q5b-2 §8.5)
  41: make(41, [
    { term: '過去を割り切る前向きさ', source: '弦本 (2003), p.207', semanticTag: '心理的原動力' },
    { term: '相手を読みとる冷静な洞察', source: '弦本 (2012), p.92', semanticTag: '認知特性' },
    { term: '焦らず実力を蓄える大物感', source: 'ISDマニュアル', semanticTag: '実務能力' },
    { term: '権威に逆らわず好機を待つ', source: '能見 (1971), p.126', semanticTag: '行動特性' },
    { term: '周囲を笑顔にするムード', source: '能見系派生資料', semanticTag: '意思疎通' },
    { term: '粘り強くコツコツ取り組む', source: '弦本 (2012), p.94', semanticTag: '行動特性' },
    { term: '誰とでも身構えずに接する', source: '弦本 (2003), p.208', semanticTag: '対人態度' },
    { term: '従順の裏でワガママを通す', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 42: 足腰の強いチータ (Q5b-1 §4.4)
  42: make(42, [
    { term: '限界を恐れぬ貪欲な野心', source: '弦本 (2003), p.208', semanticTag: '自己認知' },
    { term: '海外に目を向ける広い視野', source: '弦本 (2003), p.210', semanticTag: '認知特性' },
    { term: '実績に裏打ちされた行動', source: '能見 (1971), p.197', semanticTag: '行動傾向' },
    { term: '焦燥感による拙速な決定', source: 'ISDマニュアル, Vol.1', semanticTag: '意思決定' },
    { term: '桁外れのフィジカルな駆動', source: '弦本 (2012), p.138', semanticTag: '行動傾向' },
    { term: '誰もやらない大事業への挑戦', source: '服部 (2012), p.85', semanticTag: '行動傾向' },
    { term: '他者を待てない短気な衝動', source: '弦本 (2003), p.213', semanticTag: '対人関係' },
    { term: '実利を掴む確固たるセンス', source: 'ISDマニュアル, Vol.1', semanticTag: '認知特性' },
  ]),
  // ID 43: 動きまわる虎 (Q5b-2 §7.2)
  43: make(43, [
    { term: '頭脳明晰な合理的分析', source: '弦本 (2003), p.183', semanticTag: '思考スタイル' },
    { term: '損得を超えた他者貢献', source: '能見系派生資料', semanticTag: '行動特性' },
    { term: '鋭敏な状況観察眼', source: '弦本 (2012), p.46', semanticTag: '認知特性' },
    { term: '先回りして動く俊敏性', source: '能見 (1971), p.95', semanticTag: '行動特性' },
    { term: '博識な知識の即時活用', source: 'ISDマニュアル', semanticTag: '実務能力' },
    { term: '親しみやすい誠実対話', source: '弦本 (2012), p.48', semanticTag: '意思疎通' },
    { term: '多角的な同時処理能力', source: '能見 (1971), p.96', semanticTag: '実務能力' },
    { term: '何でも抱え込む器用貧乏', source: '弦本 (2003), p.185', semanticTag: '失敗パターン' },
  ]),
  // ID 44: 情熱的な黒ひょう (Q5b-1 §5.2)
  44: make(44, [
    { term: '理想を語り尽くす圧倒的熱量', source: '弦本 (2003), p.238', semanticTag: '行動傾向' },
    { term: '自己のビジョンへの過度な陶酔', source: '弦本 (2003), p.240', semanticTag: '自己認知' },
    { term: '美的価値を創出する感性', source: 'ISDマニュアル, Vol.1', semanticTag: '認知特性' },
    { term: '周囲の熱意に火をつける鼓舞', source: '能見 (1971), p.216', semanticTag: '対人関係' },
    { term: '独自のスタイリッシュな表現', source: '弦本 (2012), p.162', semanticTag: '行動傾向' },
    { term: '信念を貫く高潔な態度', source: '服部 (2012), p.94', semanticTag: '自己認知' },
    { term: '現実的な矛盾に対する盲目', source: '弦本 (2003), p.243', semanticTag: '認知特性' },
    { term: '共感的な同志の結束促進', source: 'ISDマニュアル, Vol.1', semanticTag: '対人関係' },
  ]),
  // ID 45: サービス精神旺盛な子守熊 (Q5b-3 #14)
  45: make(45, [
    { term: '周囲を楽しませる卓越したおもて', source: '弦本 (2003), p.214', semanticTag: '社会的技能' },
    { term: '衝突を回避する一貫した平和主義', source: 'ISDマニュアル各種', semanticTag: '対人関係' },
    { term: '他者を立てる極めて謙虚な対人姿勢', source: '能見 (1971), p.110', semanticTag: '対人態度' },
    { term: '相手の心の機微を察する繊細な勘', source: '弦本 (2012), p.120', semanticTag: '感情認識' },
    { term: 'おとなしそうに見えて盛り上げ上手', source: '服部 (2012), p.160', semanticTag: 'コミュニケーション' },
    { term: '利害を的確に把握する優れた損得', source: 'ISDマニュアル各種', semanticTag: '資源管理' },
    { term: '気分転換を上手にこなすセルフケア', source: '弦本 (2003), p.215', semanticTag: '心理的特性' },
    { term: '他者に合わせすぎて崩れる神経質', source: '能見 (1971), p.112', semanticTag: '行動特性' },
  ]),
  // ID 46: 守りの猿 (Q5b-1 §3.5)
  46: make(46, [
    { term: '緻密なリスク予測と防衛', source: '弦本 (2003), p.168', semanticTag: '自己防衛' },
    { term: '現実的な保身の徹底', source: '弦本 (2003), p.170', semanticTag: '自己防衛' },
    { term: '確実な利益の再投資', source: '能見 (1971), p.174', semanticTag: '意思決定' },
    { term: '資産の堅実な管理・蓄積', source: 'ISDマニュアル, Vol.1', semanticTag: '行動傾向' },
    { term: '未知の試みに対する拒否反応', source: '弦本 (2012), p.104', semanticTag: '認知特性' },
    { term: '実利を守る冷静な計算', source: '服部 (2012), p.73', semanticTag: '認知特性' },
    { term: '細部への厳格なこだわり', source: '弦本 (2003), p.173', semanticTag: '行動傾向' },
    { term: '安定基盤の継続的維持', source: 'ISDマニュアル, Vol.1', semanticTag: '行動傾向' },
  ]),
  // ID 47: 人間味あふれるたぬき (Q5b-3 #19)
  47: make(47, [
    { term: '周囲を和ませる徹底した自己抑制', source: '弦本 (2003), p.254', semanticTag: '心理的特性' },
    { term: '争いを穏便に丸く収める仲裁の手腕', source: 'ISDマニュアル各種', semanticTag: '対人関係' },
    { term: '陽の当たらない場を支える不言実行', source: '能見 (1971), p.135', semanticTag: '実行能力' },
    { term: '誠実と勤勉と忍耐を貫く確固たる軸', source: '弦本 (2012), p.150', semanticTag: '倫理的価値観' },
    { term: '困難にへこたれない驚異の図太さ', source: '服部 (2012), p.180', semanticTag: '基本資質' },
    { term: '的確な人間観察と現実的な決断力', source: 'ISDマニュアル各種', semanticTag: '意思決定' },
    { term: '与えられた役割を黙々と果たす根性', source: '弦本 (2003), p.255', semanticTag: '実行能力' },
    { term: '本音を隠して耐え忍ぶ過度の我慢癖', source: '能見 (1971), p.137', semanticTag: '行動特性' },
  ]),
  // ID 48: 品格のあるチータ (Q5b-3 #20)
  48: make(48, [
    { term: '失敗を即座に成功に変えるプラス', source: '弦本 (2003), p.262', semanticTag: '認知スタイル' },
    { term: '周囲の人々を魅了する高い審美眼', source: 'ISDマニュアル各種', semanticTag: '創造性' },
    { term: '他者の感情を素早く読み取る配慮', source: '能見 (1971), p.140', semanticTag: '対人関係' },
    { term: 'プライドと成功への強い貪欲さ', source: '弦本 (2012), p.156', semanticTag: '自己認識' },
    { term: '決意した瞬間に全てを賭ける努力', source: '服部 (2012), p.184', semanticTag: '実行能力' },
    { term: '抜群の社交力と屈託のない明るさ', source: 'ISDマニュアル各種', semanticTag: '社会的技能' },
    { term: '目標に向かい最短で直走るエネルギー', source: '弦本 (2003), p.263', semanticTag: '行動傾向' },
    { term: '慌てん坊で小さな事象を見落とす癖', source: '能見 (1971), p.142', semanticTag: '行動特性' },
  ]),
  // ID 49: ゆったりとした悠然の虎 (Q5b-3 #21)
  49: make(49, [
    { term: '誰に対しても絶対に媚びない真心', source: '弦本 (2003), p.270', semanticTag: '心理的特性' },
    { term: '大らかで母性的な極めて深い包容', source: 'ISDマニュアル各種', semanticTag: '対人関係' },
    { term: '円満な関係を広げる驚異の社交力', source: '能見 (1971), p.145', semanticTag: '社会的技能' },
    { term: '迅速で的確な人間観察と事態分析', source: '弦本 (2012), p.162', semanticTag: '感情認識' },
    { term: '動じることのない悠然とした安定感', source: '服部 (2012), p.188', semanticTag: '基本資質' },
    { term: '他者からの相談を引き受ける器の大きさ', source: 'ISDマニュアル各種', semanticTag: '対人関係' },
    { term: '過去に囚われない卓越した楽観主義', source: '弦本 (2003), p.271', semanticTag: '認知スタイル' },
    { term: '内面の神経質さゆえの取り越し苦労', source: '能見 (1971), p.147', semanticTag: '行動特性' },
  ]),
  // ID 50: 落ち込みの激しい黒ひょう (Q5b-1 §5.3)
  50: make(50, [
    { term: 'プライドの高さと傷つきやすさ', source: '弦本 (2003), p.248', semanticTag: '自己認知' },
    { term: '些細な批判による激しい落胆', source: '弦本 (2003), p.250', semanticTag: '自己防衛' },
    { term: '他者の不快を察知する察知力', source: '能見 (1971), p.222', semanticTag: '認知特性' },
    { term: '内省の深化による自己成長', source: 'ISDマニュアル, Vol.1', semanticTag: '認知特性' },
    { term: '孤立への不安と防衛本能', source: '弦本 (2012), p.170', semanticTag: '自己防衛' },
    { term: '優しく繊細な他者理解', source: '服部 (2012), p.97', semanticTag: '対人関係' },
    { term: '被害者意識による行動拒絶', source: '弦本 (2003), p.253', semanticTag: '行動傾向' },
    { term: '心を通わせる深い安心感', source: 'ISDマニュアル, Vol.1', semanticTag: '対人関係' },
  ]),
  // ID 51: 我が道を行くライオン (Q5b-1 §6.1)
  51: make(51, [
    { term: '他者の基準を認めぬ徹底した自律', source: '弦本 (2003), p.278', semanticTag: '自己認知' },
    { term: '協調を放棄した圧倒的な独走', source: '弦本 (2003), p.280', semanticTag: '行動傾向' },
    { term: '完璧な品質を求める執念', source: '能見 (1971), p.240', semanticTag: '行動特性' },
    { term: 'お世辞や媚びを嫌う気高さ', source: 'ISDマニュアル, Vol.1', semanticTag: '対人関係' },
    { term: '誰にも真似できない独自の境地', source: '弦本 (2012), p.194', semanticTag: '認知特性' },
    { term: '自主的な時間の侵犯への激怒', source: '服部 (2012), p.106', semanticTag: '自己防衛' },
    { term: '動揺を見せない静かな威風', source: '弦本 (2003), p.283', semanticTag: '自己防衛' },
    { term: '自立に基づく完璧主義', source: 'ISDマニュアル, Vol.1', semanticTag: '意思決定' },
  ]),
  // ID 52: 統率力のあるライオン (Q5b-1 §6.2)
  52: make(52, [
    { term: '組織全体を掌握する強固な統治', source: '弦本 (2003), p.288', semanticTag: '意思決定' },
    { term: '厳格すぎるルールの強要', source: '弦本 (2003), p.290', semanticTag: '対人関係' },
    { term: '絶対的な弱者保護の精神', source: 'ISDマニュアル, Vol.1', semanticTag: '対人関係' },
    { term: '威風堂々たる大局的決断', source: '能見 (1971), p.246', semanticTag: '意思決定' },
    { term: '批判や反論に対する徹底的圧殺', source: '弦本 (2012), p.202', semanticTag: '自己防衛' },
    { term: '組織に秩序をもたらす絶対正義', source: '服部 (2012), p.109', semanticTag: '自己認知' },
    { term: '信頼に裏打ちされた背中の強さ', source: '弦本 (2003), p.293', semanticTag: '行動傾向' },
    { term: '揺るぎなき信念の強固な推進', source: 'ISDマニュアル, Vol.1', semanticTag: '行動傾向' },
  ]),
  // ID 53: 感情豊かな黒ひょう (Q5b-1 §5.4)
  53: make(53, [
    { term: '喜怒哀楽のストレートな表出', source: '弦本 (2003), p.258', semanticTag: '行動傾向' },
    { term: '感情の起伏による周囲の攪乱', source: '弦本 (2003), p.260', semanticTag: '対人関係' },
    { term: '流行を素早く察知する感性', source: '能見 (1971), p.228', semanticTag: '認知特性' },
    { term: '誰かと感動を分かち合う衝動', source: 'ISDマニュアル, Vol.1', semanticTag: '対人関係' },
    { term: '素直で邪気のない愛嬌', source: '弦本 (2012), p.178', semanticTag: '自己認知' },
    { term: '直感的で素早いリアクション', source: '服部 (2012), p.100', semanticTag: '意思決定' },
    { term: '気分の変動に伴う一貫性の欠如', source: '弦本 (2003), p.263', semanticTag: '行動傾向' },
    { term: '周囲を明るくする陽気な存在', source: 'ISDマニュアル, Vol.1', semanticTag: '対人関係' },
  ]),
  // ID 54: 楽天的な虎 (Q5b-2 §7.3)
  54: make(54, [
    { term: '悠然たる不動の大物感', source: '弦本 (2003), p.186', semanticTag: 'パーソナリティ' },
    { term: '逆境で手を差し伸べる強運', source: '弦本 (2012), p.51', semanticTag: '行動特性' },
    { term: '大局を捉える静かな思考', source: '能見系派生資料', semanticTag: '思考スタイル' },
    { term: '苦難を乗り越える自立心', source: '能見 (1971), p.98', semanticTag: '心理的原動力' },
    { term: '大らかな博愛主義の体現', source: 'ISDマニュアル', semanticTag: '基本価値観' },
    { term: '包容力に満ちたリーダー', source: '弦本 (2012), p.53', semanticTag: '社会的役割' },
    { term: '自己を崩さぬマイペース', source: '弦本 (2003), p.187', semanticTag: '行動特性' },
    { term: '納得なき指図への猛反発', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 55: パワフルな虎 (Q5b-2 §7.4)
  55: make(55, [
    { term: '豪快でエネルギッシュ', source: '弦本 (2003), p.189', semanticTag: 'パーソナリティ' },
    { term: '徹底的な有言実行力', source: '弦本 (2012), p.56', semanticTag: '行動特性' },
    { term: '多芸多才なマルチ実務', source: 'ISDマニュアル', semanticTag: '実務能力' },
    { term: '冷静不敵なリスクヘッジ', source: '能見 (1971), p.101', semanticTag: '思考スタイル' },
    { term: '計画通りの着実推進', source: '能見系派生資料', semanticTag: 'タスク管理' },
    { term: '博愛を軸にする仲間擁護', source: '弦本 (2012), p.58', semanticTag: '基本価値観' },
    { term: '相手を圧倒する信頼感', source: '弦本 (2003), p.190', semanticTag: '社会的信用' },
    { term: '言い方にキレる突発憤慨', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
  // ID 56: 気どらない黒ひょう (Q5b-3 #22)
  56: make(56, [
    { term: 'ありのままに生きる極めて素朴な人', source: '弦本 (2003), p.278', semanticTag: '基本資質' },
    { term: '誰に対しても公平で誠実な対応', source: 'ISDマニュアル各種', semanticTag: '対人関係' },
    { term: '人々を優しく引き受ける高い抱擁', source: '能見 (1971), p.150', semanticTag: '対人関係' },
    { term: '自己の世界を守るための厳格な境界', source: '弦本 (2012), p.168', semanticTag: '心理的防衛' },
    { term: '思い立ったら即実行に移す決断力', source: '服部 (2012), p.192', semanticTag: '行動特性' },
    { term: '誰にも頼らず自力で完遂する根性', source: 'ISDマニュアル各種', semanticTag: '基本資質' },
    { term: 'スマートに生きるための夢への意欲', source: '弦本 (2003), p.279', semanticTag: '心理的欲求' },
    { term: 'じっと佇むことができない極度の焦燥', source: '能見 (1971), p.152', semanticTag: '行動特性' },
  ]),
  // ID 57: 感情的なライオン (Q5b-3 #24)
  57: make(57, [
    { term: '嘘やごまかしを許さない徹底本音', source: '弦本 (2003), p.294', semanticTag: '倫理的価値観' },
    { term: '表向きの謙虚さと腰の低い優れた社交性', source: 'ISDマニュアル各種', semanticTag: '社会的適応' },
    { term: '高い理想に向かい地道に進む持続力', source: '能見 (1971), p.160', semanticTag: '実行能力' },
    { term: '弱者救済のための自己犠牲精神', source: '弦本 (2012), p.180', semanticTag: '倫理的価値観' },
    { term: '特別扱いを求め王座を目指すプライド', source: '服部 (2012), p.200', semanticTag: '自己認識' },
    { term: '心を許した相手に見せる強烈な甘え', source: 'ISDマニュアル各種', semanticTag: '対人関係' },
    { term: '状況を打開するカリスマ的な指導力', source: '弦本 (2003), p.295', semanticTag: '影響力' },
    { term: '気分が激しく変動する過剰な喜怒哀楽', source: '能見 (1971), p.162', semanticTag: '行動特性' },
  ]),
  // ID 58: 傷つきやすいライオン (Q5b-1 §6.4)
  58: make(58, [
    { term: '王者の仮面の裏の超極細な感受性', source: '弦本 (2003), p.308', semanticTag: '自己認知' },
    { term: '弱みを隠すための過度な高慢', source: '弦本 (2003), p.310', semanticTag: '自己防衛' },
    { term: '礼儀とマナーへの徹底したこだわり', source: '能見 (1971), p.258', semanticTag: '対人関係' },
    { term: '完璧主義がもたらす内心の焦燥', source: 'ISDマニュアル, Vol.1', semanticTag: '意思決定' },
    { term: '傷つけられた際の激しい心を閉ざし', source: '弦本 (2012), p.218', semanticTag: '自己防衛' },
    { term: '密かな血の滲むような努力の維持', source: '服部 (2012), p.115', semanticTag: '行動傾向' },
    { term: '他人の非礼を決して許さぬ厳格', source: '弦本 (2003), p.313', semanticTag: '対人関係' },
    { term: '繊細さを糧にした高度な職人技', source: 'ISDマニュアル, Vol.1', semanticTag: '認知特性' },
  ]),
  // ID 59: 束縛を嫌う黒ひょう (Q5b-3 #23)
  59: make(59, [
    { term: '最先端のトレンドを捉える鋭い感性', source: '弦本 (2003), p.286', semanticTag: '認知能力' },
    { term: '外部からの指示や束縛を嫌う自律欲', source: 'ISDマニュアル各種', semanticTag: '心理的欲求' },
    { term: '理性と情緒の調和が取れた平和主義', source: '能見 (1971), p.155', semanticTag: '基本資質' },
    { term: '生涯を通じて拡大し続ける多彩な人', source: '弦本 (2012), p.174', semanticTag: '社会的関係' },
    { term: '不正や卑怯を絶対に容認しない熱血', source: '服部 (2012), p.196', semanticTag: '倫理的価値観' },
    { term: '人当たりの良いお人好しの社交能力', source: 'ISDマニュアル各種', semanticTag: '対人関係' },
    { term: '専門的領域で発揮される鋭いセンス', source: '弦本 (2003), p.287', semanticTag: '創造性' },
    { term: '思い通りにいかない時の露骨な不機嫌', source: '能見 (1971), p.157', semanticTag: '行動特性' },
  ]),
  // ID 60: 慈悲深い虎 (Q5b-2 §7.5)
  60: make(60, [
    { term: '純粋無垢な朗らかさ', source: '弦本 (2003), p.192', semanticTag: 'パーソナリティ' },
    { term: '人情最優先のフレンドリー', source: '弦本 (2012), p.61', semanticTag: '対人態度' },
    { term: '誰にでも尽くす慈愛行動', source: 'ISDマニュアル', semanticTag: '行動特性' },
    { term: '夢を現実にする不退転努力', source: '能見 (1971), p.104', semanticTag: '心理的原動力' },
    { term: '細心な気配りと誠実さ', source: '能見系派生資料', semanticTag: '対人態度' },
    { term: '弱い立場を助ける正義感', source: '弦本 (2012), p.63', semanticTag: '基本価値観' },
    { term: '堂々たる風格とリーダー', source: '弦本 (2003), p.193', semanticTag: '社会的役割' },
    { term: 'お世辞に乗せられる軽率', source: 'ISDマニュアル', semanticTag: '失敗パターン' },
  ]),
}
