# **12問・5段階リッカート尺度を用いたMBTI簡易診断の構築：心理測定学的妥当性と質問設計のベストプラクティス**

現代のパーソナリティ心理学および産業・組織心理学の文脈において、マイヤーズ・ブリッグス・タイプ指標（MBTI）は、個人の認知スタイルや対人傾向を理解するための最も普及したフレームワークの一つとして君臨しています1。MBTIは、スイスの精神分析医カール・グスタフ・ユングが1921年に提唱した「心理学的類型論」を基礎としており、キャサリン・クック・ブリッグスとその娘イザベル・ブリッグス・マイヤーズによって、一般の人々が自己理解や他者理解を深めるための実用的なツールとして発展を遂げました3。本来、公式なMBTI診断（Form MやForm Qなど）は、統計的な信頼性と妥当性を確保するために93問から144問という膨大な質問数を要し、回答には相応の時間を必要とします2。しかし、デジタルコミュニケーションの加速や、Webマーケティング、チームビルディングの初期段階における簡易的なアセスメントの需要が高まる中で、精度を維持しつつ極限まで回答負荷を軽減した「短縮版」の設計が求められています。

本レポートでは、12問という極めて限定された設問数で、5段階リッカート尺度を採用しながら、MBTIの4つの二分法的指標（E/I、S/N、T/F、J/P）を診断するためのベストプラクティスを詳述します。心理測定学的な整合性、質問文の言語的精査、そして回答から16タイプを導き出すためのスコアリングロジックについて、学術的根拠と実務的な知見を融合させた体系的な指針を提示します。

## **第1章：MBTIの理論的構造と短縮版設計の意義**

MBTIの根幹をなすのは、人間が外界と接する際の「心の習慣」を4つの対立する軸で整理するモデルです。これらの指標は、個人の能力やスキルを示すものではなく、あくまで「どちらを好むか」という先天的・習慣的な「指向（Preference）」を測定するものです6。12問という制約下で診断を構築する場合、各指標に対して割り当てられる設問数はわずか3問となります。この極小の設問数で意味のある結果を導き出すためには、理論的背景の深い理解が不可欠です。

### **4つの二分法的指標の定義と行動特性**

MBTIのタイプを決定する4つの指標は、エネルギーの方向、情報の取り込み、意思決定の基準、そして外界への接し方という、人間の認知プロセスの主要な局面をカバーしています8。

| 指標（指向） | 対立する極 | 核心となる問い | 主な行動特性 |
| :---- | :---- | :---- | :---- |
| **外向(E) / 内向(I)** | エネルギーの方向 | どこから活力を得るか？ | E: 外界、他者との交流、活動的 10 I: 内面、独りの時間、内省的 4 |
| **感覚(S) / 直観(N)** | 情報の取り込み | 何に注意を向けるか？ | S: 事実、具体性、過去の経験 8 N: 可能性、抽象概念、ひらめき 1 |
| **思考(T) / 感情(F)** | 判断の基準 | どのように結論を出すか？ | T: 論理、客観性、原理原則 9 F: 価値観、共感、調和 6 |
| **判断(J) / 知覚(P)** | 外界への接し方 | どのように生活を整えるか？ | J: 計画、構造、決着を好む 3 P: 柔軟、自発性、選択肢を保つ 13 |

4

簡易診断において12問という構成は、これらの4指標それぞれに3問ずつ配置することで、単一の質問による測定誤差を最小限に抑えつつ、回答者の負担を劇的に軽減する「スイートスポット」であると考えられます16。先行研究である「Personality Identity Estimator (PIE)」は、まさに各指標3問ずつの12問構成を採用しており、MBTI公式テストとの高い相関を示しています16。

### **心理測定学における短縮尺度の重要性**

心理測定学の理論によれば、尺度の長さは信頼性と正の相関関係にあります。これは、質問数が増えるほど偶然の回答誤差が相殺され、真の値に近いスコアが得られるためです19。しかし、あまりに長い質問紙は回答者の疲労、飽き、そして不誠実な回答（ランダム回答や社会的望ましさバイアス）を引き起こすリスクがあります19。

特にWebサイトやアプリでのエンゲージメントを目的とした診断では、10問から20問程度が離脱を防ぎつつ満足度を維持できる限界値とされています21。12問という構成は、SF-12（健康関連QOL調査）などの医療分野でも広く用いられており、長いバージョン（SF-36）の結果を91%以上の精度で再現できることが実証されています23。MBTIにおいても、代表的な行動特性を的確に突いた質問文を設計することで、12問であっても個人の「ベストフィット・タイプ」を推定するための極めて有効なスクリーニング・ツールとなり得ます16。

## **第2章：5段階リッカート尺度の採用と設計ロジック**

本プロジェクトで採用する「5段階リッカート尺度」は、1932年に心理学者レンシス・リッカートによって開発された手法であり、特定の記述に対する同意の程度を測定します25。MBTIの公式診断で伝統的に用いられてきたのは、二つの選択肢から一つを強制的に選ばせる「二者択一形式（Forced-choice format）」ですが、簡易診断においてはリッカート尺度の方がユーザーにとって直感的であり、微妙な好みの強さを反映できるという利点があります14。

### **リッカート尺度の選択肢構成**

5段階尺度は、回答者に過度な認知的負担をかけず、かつ中立の立場も許容するバランスの取れた構成です27。

1. **強くそう思う（5点）**: 指標の特性が顕著であり、確固たる指向を持っている。  
2. **そう思う（4点）**: 全体的な傾向としてその指向を持っているが、状況による柔軟性もある。  
3. **どちらともいえない（3点）**: 状況によって使い分けている、あるいは明確な指向を感じない。  
4. **あまりそう思わない（2点）**: 反対側の指標に近い傾向を持っている。  
5. **全くそう思わない（1点）**: 反対側の指標の特性が顕著である。

26

日本人の回答傾向として、真ん中の「どちらともいえない」に回答が集中する「中心化傾向」が見られることがしばしば指摘されます27。これを防ぐためには、質問文を具体的かつ極端すぎない表現に調整し、回答者が自身の行動を想起しやすいように工夫する必要があります29。

### **逆転項目の組み込みによるバイアス対策**

12問という短い診断において、回答者が内容を精査せずに「すべて『そう思う』」と答える「黙諾の偏り（Acquiescence bias）」は致命的な誤差を生みます25。これを防ぐための強力な手法が「逆転項目（Reverse-coded items）」の導入です。

各指標3問の構成のうち、1問ないし2問を、測定したい極とは反対の極（例えば、外向性を測るセクションで内向的な行動を肯定する文）として配置します20。これにより、回答者は各質問に対して意識的に注意を払う必要が生じ、より精度の高いデータ収集が可能になります25。

## **第3章：質問文作成のベストプラクティスと具体的構成**

簡易診断の成功は、質問文の「表面的妥当性（Face Validity）」、すなわち、その質問が何を測ろうとしているのかが回答者にとって納得感があるかどうかにかかっています31。専門用語を排除し、日常生活や職場での具体的なシチュエーションを設定することが重要です30。

### **指標別の質問構成案**

以下に、12問構成のMBTI簡易診断のための具体的な質問項目案を提示します。各項目は、先行する短縮尺度（PIE、TIPI、BFI-S）およびMBTIの最新の研究に基づき、指向の核心を突く表現を選定しています16。

#### **指標1：エネルギーの方向（E：外向 / I：内向）**

このセクションでは、活力をどこから得るか、また社会的な相互作用に対する姿勢を測定します4。

1. **Q1（E指向/正向）**: 「仕事やイベントが終わった後、友人や知人と集まって話すことで、疲れが取れて元気が湧いてくると感じることが多い。」 10  
2. **Q2（I指向/逆転）**: 「グループでの議論に参加する際、自分の意見を述べる前に、まず周囲の意見をじっくり聞いて頭の中で整理したい。」 14  
3. **Q3（E指向/正向）**: 「新しい環境や初対面の人たちの集まりでも、自分から積極的に話しかけ、交流のきっかけを作るのが得意だ。」 14

#### **指標2：情報の取り込み（S：感覚 / N：直観）**

このセクションでは、事実を重視するか、それとも背後の意味や可能性を重視するかを測定します2。

4. **Q4（S指向/正向）**: 「新しい仕事を学ぶとき、抽象的な概念や理論よりも、具体的な手順や過去の成功事例を示される方が理解しやすい。」 14  
5. **Q5（N指向/逆転）**: 「現状を維持することよりも、『もしこうなったら？』という未来の可能性や、斬新なアイデアを構想することにワクワクする。」 6  
6. **Q6（S指向/正向）**: 「周囲からは、空想家というよりも、現実的で着実に物事を進める『地に足がついた人』だと思われている。」 2

#### **指標3：判断の基準（T：思考 / F：感情）**

このセクションでは、意思決定において客観的な論理を優先するか、それとも人間関係や価値観を優先するかを測定します4。

7. **Q7（T指向/正向）**: 「重要な判断を下す際、たとえ誰かの感情を害する可能性があっても、客観的なデータや論理的な正しさを優先すべきだと思う。」 4  
8. **Q8（F指向/逆転）**: 「仕事の場であっても、チームの調和やメンバーの気持ちに配慮することが、効率を追求すること以上に大切だと感じる。」 4  
9. **Q9（T指向/正向）**: 「議論をするとき、相手の情熱や熱意に共感することよりも、その主張に一貫性と合理的な根拠があるかを重視する。」 14

#### **指標4：外界への接し方（J：判断 / P：知覚）**

このセクションでは、計画性を好むか、それとも柔軟性を好むかを測定します2。

10. **Q10（J指向/正向）**: 「週末や休暇を過ごすとき、あらかじめ大まかな予定やスケジュールが決まっている方が、安心して楽しむことができる。」 2  
11. **Q11（P指向/逆転）**: 「締め切りギリギリまで選択肢を広げておきたいタイプで、状況に合わせてその場で臨機応変に行動することに楽しみを感じる。」 2  
12. **Q12（J指向/正向）**: 「やりかけの仕事や決まっていない案件があると落ち着かず、できるだけ早く決着をつけてスッキリさせたいと思う。」 2

### **質問作成上の留意点：ダブルバーレルの回避と中立性**

質問文を作成する際、心理学的に「ダブルバーレル質問」と呼ばれる、1つの設問で2つの異なる事柄を問う表現は厳禁です26。例えば、「私は論理的で、かつテキパキと計画を立てるのが得意だ」という文は、思考型(T)と判断型(J)の二つの異なる特性を混ぜてしまっており、回答者がどちらに反応したのかが判別できなくなります。

また、誘導的な表現（例：「あなたは優れた共感力を持っており、他人の痛みがわかりますか？」）は避け、各指標の極が同等に価値があるように感じられる「中立的で肯定的なトーン」を維持することが、正確な自己申告を引き出す鍵となります21。MBTIの強みは、すべてのタイプに長所と短所があるという「ダイバーシティ（多様性）」の肯定にあるため、質問文もその精神を反映させるべきです6。

## **第4章：スコアリング・アルゴリズムとタイプ導出プロセス**

収集されたリッカート尺度のデータを16タイプ（例：INTJ、ESFPなど）へと変換するためには、数学的な処理と統計的なしきい値の設定が必要です。簡易診断においては、各指標の合計スコアを算出し、その中央値との比較によってタイプを判定するロジックが一般的です40。

### **合計スコアの算出（逆転項目の処理）**

まず、すべての質問に対して、特定の極（E、S、T、J）を向くように数値を整えます。正向項目のスコアはそのままで、逆転項目については以下の計算式を用いてスコアを反転させます20。

![][image1]  
例えば、Q2（内向指向の逆転項目）で「5（強くそう思う）」と答えた場合、計算上は「6 \- 5 \= 1」となり、外向性(E)のスコアとしては最低点になります。

各指標（3問ずつ）の合計スコアを計算します：

* **外向性スコア (![][image2])** \= Q1 \+ (6 \- Q2) \+ Q3  
* **感覚性スコア (![][image3])** \= Q4 \+ (6 \- Q5) \+ Q6  
* **思考性スコア (![][image4])** \= Q7 \+ (6 \- Q8) \+ Q9  
* **判断性スコア (![][image5])** \= Q10 \+ (6 \- Q11) \+ Q12

各合計スコアは、最小3点、最大15点となり、理論上の中央値は9点となります。

### **タイプ判定のしきい値とタイブレーカーの設定**

合計スコアが中央値（9点）より高いか低いかによって、その指標のアルファベットを決定します40。

| 指標 | 合計スコア \> 9 | 合計スコア \< 9 |
| :---- | :---- | :---- |
| **エネルギー (E-I)** | **E** (外向) | **I** (内向) |
| **情報収集 (S-N)** | **S** (感覚) | **N** (直観) |
| **意思決定 (T-F)** | **T** (思考) | **F** (感情) |
| **外界接触 (J-P)** | **J** (判断) | **P** (知覚) |

スコアがちょうど9点（中央値）になった場合の処理、すなわち「タイブレーカー」については、診断の設計思想によりいくつかの方法があります34。

1. **デフォルト指向の割り当て**: 統計的に日本人に多いタイプや、MBTIの標準的な処理慣習に従い、タイの場合は「I、N、F、P」側に倒すなどのルールを設けます40。  
2. **13問目の投入**: 指標がタイになった時だけ表示される、追加の二者択一質問を用意します34。  
3. **パーセンテージ表示**: 特定のタイプに固定せず、「E：50% / I：50%」として柔軟なタイプ結果を提示します2。

簡易診断のUX（ユーザー体験）を優先する場合、最も明確な結果を提示できる「デフォルト指向の割り当て」が推奨されます。

### **指標の明瞭性：PCI（Preference Clarity Index）の算出**

単に4文字のコードを出すだけでなく、その指向がどれほど「はっきりしているか」を提示することで、診断の信頼性とユーザーの納得感を高めることができます。これを「指向の明瞭性指数（PCI）」と呼びます2。

![][image6]  
この計算により、合計スコアが15点または3点であればPCIは100%（非常に明確）、9点に近いほどPCIは0%に近づき（わずかな傾向）、自身の指向の強弱を可視化できます2。

## **第5章：16性格タイプの体系的理解と結果表示の設計**

4つの指標の組み合わせから導き出される16のタイプは、単なるラベルの集合ではなく、それぞれのタイプが独自の「認知のダイナミクス」を持っています37。簡易診断であっても、結果画面ではユーザーが自身の強みや課題を立体的に理解できるよう、情報を整理して提示する必要があります。

### **4つの気質（テンペラメント）グループによる整理**

16タイプを理解しやすくするための強力な分類法が、デヴィッド・カーシーらによって提唱された「4つの気質」です1。

| 気質グループ | 該当タイプ | 特徴と動機 |
| :---- | :---- | :---- |
| **合理主義者 (NT)** | INTJ, INTP, ENTJ, ENTP | 知的能力、論理性、戦略的思考を重視する 1 |
| **理想主義者 (NF)** | INFJ, INFP, ENFJ, ENFP | 自己実現、他者への貢献、意味の追求を重視する 14 |
| **守護者 (SJ)** | ISTJ, ISFJ, ESTJ, ESFJ | 義務、責任、伝統、社会秩序の維持を重視する 2 |
| **職人・探検家 (SP)** | ISTP, ISFP, ESTP, ESFP | 行動力、実利、楽しさ、現在への適応を重視する 1 |

結果画面では、まずこの気質グループとしての共通性を提示し、その後に各タイプ固有のプロファイルを詳述することで、ユーザーは自身の性格の「大枠」と「詳細」を段階的に理解できます37。

### **各タイプの核心：職場・人間関係における強みと盲点**

簡易診断の結果を「役に立つ」ものにするためには、単なる性格記述にとどまらず、具体的な行動指針を提供することが求められます。

* **職場でのフィット感**: 各タイプが最も能力を発揮できる環境や役割（例：INTJは戦略立案、ESFJはチームの調和維持）を明示します2。  
* **ストレス下での反応**: MBTI理論における「グリップ状態（劣等機能の暴走）」について触れ、ストレス時に陥りやすいパターンと対処法をアドバイスします14。  
* **他者とのコミュニケーション**: 自分とは異なるタイプとの接し方（例：感情型の相手にはまず共感を示す、思考型の相手には論理で話す）を提示することで、実生活での活用を促します11。

## **第6章：短縮版MBTI診断の限界と倫理的配慮**

12問という簡易的な構成は、あくまで「入り口」であり、包括的な心理アセスメントの代替にはなり得ません2。開発者は以下の限界を認識し、ユーザーに対してもその旨を適切に通知する義務があります。

### **心理測定学的な批判と限界**

学術界において、MBTIはいくつかの重要な批判にさらされてきました。

1. **予測妥当性の欠如**: 特定の職業での成功やパフォーマンスを予測する力は、ビッグファイブ（Big Five）などの特性論的モデルに比べて低いとされています3。  
2. **再テスト信頼性の課題**: 数週間から数ヶ月の期間を空けて再受験した場合、39%から76%の人が異なるタイプ結果を得るという研究データがあります3。  
3. **二項対立の不自然さ**: 多くの性格特性は正規分布（中央に多くの人が集まる）しており、人々を強引に「EかIか」の二択に分類することは、中間的な性質を持つ多数の人々の実態を無視しているという指摘があります3。

これらの批判を念頭に、簡易診断の結果は「固定的なラベル」ではなく、自己探求のための「仮説」や「会話のきっかけ」として提示されるべきです1。

### **診断提供者としての倫理指針**

公式なMBTIの倫理ガイドラインでは、パーソナリティタイプを理由にした採用選考、昇進判断、または不適切なレッテル貼りに使用することを厳格に禁じています2。

簡易診断を公開する際は、以下の免責事項や配慮を含めることがベストプラクティスです。

* 「この診断はエンターテインメントおよび自己理解の補助を目的としたものであり、医学的・心理学的な診断を提供するものではありません。」 46  
* 「パーソナリティタイプに優劣はありません。各タイプが独自の価値と可能性を持っています。」 6  
* 「結果が自分に当てはまらないと感じる場合は、自身の内面的な感覚（ベストフィット・タイプ）を優先してください。」 43

## **第7章：エンゲージメントを高めるUXデザインの工夫**

12問という短い診断であっても、ユーザーの体験価値を最大化し、共有（シェア）を促進するための工夫を凝らすことで、診断の価値は飛躍的に向上します。

### **視覚的・構造的演出**

* **一問一画面形式**: 回答者を一つの質問に集中させ、テンポ良く進めるために、一画面につき一問を表示するUIが推奨されます30。  
* **プログレスバーの表示**: 「今、全体の何%まで完了したか」を視覚化することで、回答者の心理的な負担を軽減し、完了率を高めます21。  
* **イラストとキャラクター**: 各指標やタイプに関連したアイコンやイラストを用いることで、抽象的な理論を親しみやすいものに変えます21。

### **自己投影を促すシナリオ設定**

「自己投影しやすい」質問文を作るための手法として、回答者の過去の記憶や将来の願望を刺激する表現を取り入れます33。例えば、単に「計画を立てるのが好きですか？」と聞くよりも、「旅行に行く際、事前に分刻みの旅程を立てることに喜びを感じるタイプですか？」といった具体的なシーンを提示することで、回答者はよりリアルに自分を重ね合わせることができます33。

また、「制約の解除」という手法も有効です。「もし、お金や時間の制限が一切ないとしたら、あなたはどのような週末を過ごしたいですか？」といった仮定法を用いることで、社会的役割（ペルソナ）に縛られない「本来の指向」を引き出すことが可能になります33。

## **結論：構築へのロードマップ**

12問・5段階リッカート尺度を用いたMBTI簡易診断の構築は、理論的な厳密さとユーザー体験の簡便さを高い次元で融合させる作業です。本レポートで提示した指針に基づき、以下のステップで開発を進めることを推奨します。

1. **質問項目の確定**: 指標ごとに正向・逆転をバランスよく配置した12問を最終決定する16。  
2. **ロジックの実装**: 合計スコアの算出、逆転スコアリング、PCIの計算、タイブレーカーのルールをエンジンに組み込む40。  
3. **プロフィールの執筆**: 16タイプごとに、強み・盲点・アドバイスを含む魅力的で前向きな解説文を用意する2。  
4. **パイロットテストと調整**: 実際に少人数のユーザーに回答してもらい、回答時間の適正さや結果の納得感を確認し、質問文の微調整を行う21。  
5. **倫理と限界の明示**: 診断の目的と適切な利用方法について、明確なガイドラインを添えて公開する2。

この簡易診断が、個々のユーザーにとって「真の自分」と出会う第一歩となり、また多様な個性を認め合う健全な社会構築の一助となることを期待します。12問という小さな窓を通じて見える広大な人間の内面世界を、誠実かつ洗練された形で提示することこそが、本プロジェクトの真の価値です。

#### **引用文献**

1. MBTI診断とは？公式MBTIと16Personalitiesの違い、16タイプ一覧・活かし方を解説【2026年版】, 3月 22, 2026にアクセス、 [https://tfp-group.co.jp/16types/column/mbti-guide](https://tfp-group.co.jp/16types/column/mbti-guide)  
2. Myers-Briggs Test: 16 Personality Types & Career Guide \- AssessFirst, 3月 22, 2026にアクセス、 [https://www.assessfirst.com/en/blog/myers-briggs-guide](https://www.assessfirst.com/en/blog/myers-briggs-guide)  
3. Myers–Briggs Type Indicator \- Wikipedia, 3月 22, 2026にアクセス、 [https://en.wikipedia.org/wiki/Myers%E2%80%93Briggs\_Type\_Indicator](https://en.wikipedia.org/wiki/Myers%E2%80%93Briggs_Type_Indicator)  
4. A guide to understanding the MBIT personality test \- Mettl Blog, 3月 22, 2026にアクセス、 [https://blog.mettl.com/myers-briggs-personality-test/](https://blog.mettl.com/myers-briggs-personality-test/)  
5. History, Reliability and Validity of the MBTI® Instrument \- The Myers-Briggs Company, 3月 22, 2026にアクセス、 [https://ap.themyersbriggs.com/themyersbriggs-history-reliability-validity-mbti.aspx](https://ap.themyersbriggs.com/themyersbriggs-history-reliability-validity-mbti.aspx)  
6. MBTI Facts | The Myers-Briggs Company, 3月 22, 2026にアクセス、 [https://ap.themyersbriggs.com/themyersbriggs-mbti-facts.aspx](https://ap.themyersbriggs.com/themyersbriggs-mbti-facts.aspx)  
7. Myers Briggs Type Preferences Perception Judgment, 3月 22, 2026にアクセス、 [https://www.myersbriggs.org/my-mbti-personality-type/myers-briggs-overview/](https://www.myersbriggs.org/my-mbti-personality-type/myers-briggs-overview/)  
8. 就活でMBTIは使える？IとE（内向型 外向型）の違いと適職、面接での活かし方, 3月 22, 2026にアクセス、 [https://jws-japan.or.jp/whitecareer/blog/11647](https://jws-japan.or.jp/whitecareer/blog/11647)  
9. MBTIとは？16パーソナリティのタイプ別の特徴や強みと弱み、有名人、活用法を解説 | ACES Meet, 3月 23, 2026にアクセス、 [https://meet.acesinc.co.jp/blog/mbti/](https://meet.acesinc.co.jp/blog/mbti/)  
10. MBTI診断の基本とタイプ別特徴｜性格タイプの理解を深めよう, 3月 23, 2026にアクセス、 [https://shigoto-kyujin.com/blog/2025/02/17/mbti%E8%A8%BA%E6%96%AD%E3%81%AE%E5%9F%BA%E6%9C%AC%E3%81%A8%E3%82%BF%E3%82%A4%E3%83%97%E5%88%A5%E7%89%B9%E5%BE%B4%EF%BD%9C%E6%80%A7%E6%A0%BC%E3%82%BF%E3%82%A4%E3%83%97%E3%81%AE%E7%90%86%E8%A7%A3/](https://shigoto-kyujin.com/blog/2025/02/17/mbti%E8%A8%BA%E6%96%AD%E3%81%AE%E5%9F%BA%E6%9C%AC%E3%81%A8%E3%82%BF%E3%82%A4%E3%83%97%E5%88%A5%E7%89%B9%E5%BE%B4%EF%BD%9C%E6%80%A7%E6%A0%BC%E3%82%BF%E3%82%A4%E3%83%97%E3%81%AE%E7%90%86%E8%A7%A3/)  
11. Myers-Briggs Type Indicator \- StatPearls \- NCBI Bookshelf \- NIH, 3月 22, 2026にアクセス、 [https://www.ncbi.nlm.nih.gov/books/NBK554596/](https://www.ncbi.nlm.nih.gov/books/NBK554596/)  
12. 16Personalities診断とは？16種類の性格一覧や日本人に多いタイプを徹底解説！ | DYM, 3月 22, 2026にアクセス、 [https://dym.asia/media/recruiting/mbti/](https://dym.asia/media/recruiting/mbti/)  
13. Myers-Briggs Type Indicator (MBTI)® \- SYMLOG Consulting Group, 3月 22, 2026にアクセス、 [https://www.symlog.com/resources/myers-briggs-type-indicator](https://www.symlog.com/resources/myers-briggs-type-indicator)  
14. Myers-Briggs Type Indicator (MBTI) \- Simply Psychology, 3月 22, 2026にアクセス、 [https://www.simplypsychology.org/the-myers-briggs-type-indicator.html](https://www.simplypsychology.org/the-myers-briggs-type-indicator.html)  
15. 【プロが解説】16タイプ性格診断とは？16Personalitiesとの違いや16タイプの一覧、相性を解説, 3月 22, 2026にアクセス、 [https://shindancloud.com/trend/3378](https://shindancloud.com/trend/3378)  
16. Development and Validation of a Short-Form Inventory to ... \- ERIC, 3月 22, 2026にアクセス、 [https://files.eric.ed.gov/fulltext/EJ1395702.pdf](https://files.eric.ed.gov/fulltext/EJ1395702.pdf)  
17. Development and Validation of a Short-Form Inventory to Identify Personality Types: The Personality Identity Estimator (PIE) \- Conti-Creations.com, 3月 22, 2026にアクセス、 [https://www.conti-creations.com/PIE--Methodology.pdf](https://www.conti-creations.com/PIE--Methodology.pdf)  
18. Development and Validation of a Short-Form Inventory to Identify Personality Types: The Personality Identity Estimator (PIE) | Conti | Journal of Education and Learning, 3月 22, 2026にアクセス、 [https://ccsenet.org/journal/index.php/jel/article/view/0/48839](https://ccsenet.org/journal/index.php/jel/article/view/0/48839)  
19. Assessing the Big-Five Personality Domains via Short Forms \- Hogrefe eContent, 3月 22, 2026にアクセス、 [https://econtent.hogrefe.com/doi/10.1027/1015-5759.22.3.139](https://econtent.hogrefe.com/doi/10.1027/1015-5759.22.3.139)  
20. BFI-S: Big Five Inventory-Short Form (15 items) \- Testable, 3月 22, 2026にアクセス、 [https://www.testable.org/scale/bfi-s-big-five-inventory-short-form-15-items](https://www.testable.org/scale/bfi-s-big-five-inventory-short-form-15-items)  
21. プロ直伝！診断コンテンツの作り方。ロジックや作成手順を事例つきで解説 \- ヨミトル, 3月 22, 2026にアクセス、 [https://shindancloud.com/trend/728](https://shindancloud.com/trend/728)  
22. 診断コンテンツの作り方を徹底解説！ 事例付きで企画や制作ポイントを紹介｜SNSコラム, 3月 22, 2026にアクセス、 [https://www.hottolink.co.jp/column/20240917\_116695/](https://www.hottolink.co.jp/column/20240917_116695/)  
23. SF-12 Questionnaire: A Practical Measure of Physical and Mental Health \- Medbridge, 3月 23, 2026にアクセス、 [https://www.medbridge.com/blog/sf-12-questionnaire](https://www.medbridge.com/blog/sf-12-questionnaire)  
24. Simplified scoring and psychometrics of the revised 12-item Short-Form Health Survey, 3月 22, 2026にアクセス、 [https://www.researchgate.net/publication/11466141\_Simplified\_scoring\_and\_psychometrics\_of\_the\_revised\_12-item\_Short-Form\_Health\_Survey](https://www.researchgate.net/publication/11466141_Simplified_scoring_and_psychometrics_of_the_revised_12-item_Short-Form_Health_Survey)  
25. Likert Scale Questionnaire: Examples & Analysis \- Simply Psychology, 3月 22, 2026にアクセス、 [https://www.simplypsychology.org/likert-scale.html](https://www.simplypsychology.org/likert-scale.html)  
26. Psychometrics: Questionnaire Development, Likert Scales and Classical Test Theory (CTT) \- RPubs, 3月 22, 2026にアクセス、 [https://rpubs.com/castro/ctt](https://rpubs.com/castro/ctt)  
27. リッカート尺度とは｜簡単解説〜5段階・7段階評価の作り方から分析、注意点まで徹底解説, 3月 22, 2026にアクセス、 [https://qiqumo.jp/contents/dictionary/likertsscale](https://qiqumo.jp/contents/dictionary/likertsscale)  
28. アンケートの4件法・5件法とは｜メリット・デメリット、分析方法の例 | Ninout（ナインアウト）, 3月 22, 2026にアクセス、 [https://www.ninout.ai/blog/posts/analysis-20230106/](https://www.ninout.ai/blog/posts/analysis-20230106/)  
29. リッカート尺度：サンプル、ヒント、データの分析方法 \- SurveyMonkey, 3月 22, 2026にアクセス、 [https://jp.surveymonkey.com/learn/survey-best-practices/likert-scale/](https://jp.surveymonkey.com/learn/survey-best-practices/likert-scale/)  
30. 診断コンテンツの作り方と手順｜効果的な使い方や成功事例も徹底解説 | ヒアリングDXブログ, 3月 22, 2026にアクセス、 [https://www.interviewz.io/blog/sindan-contents-howto-make/](https://www.interviewz.io/blog/sindan-contents-howto-make/)  
31. 心理尺度の作り方 応用編 質問内容が生む系統誤差とその対処 \- ビジネスリサーチラボ, 3月 22, 2026にアクセス、 [https://www.business-research-lab.com/230502-2/](https://www.business-research-lab.com/230502-2/)  
32. Reliability and Validity of Psychometric Tests \- Xobin, 3月 22, 2026にアクセス、 [https://xobin.com/blog/reliability-and-validity-of-psychometric-tests/](https://xobin.com/blog/reliability-and-validity-of-psychometric-tests/)  
33. Deep Questions for Each Myers-Briggs® Personality Type \- Psychology Junkie, 3月 22, 2026にアクセス、 [https://www.psychologyjunkie.com/deep-questions-for-each-myers-briggs-personality-type/](https://www.psychologyjunkie.com/deep-questions-for-each-myers-briggs-personality-type/)  
34. MBTI \+ Insights Quick Questionnaire (25 Questions) \- Great Reminders, 3月 22, 2026にアクセス、 [https://greatreminders.com/pages/mbti](https://greatreminders.com/pages/mbti)  
35. 4 Questions That Tell You Someone's MBTI Personality \- PureWow, 3月 22, 2026にアクセス、 [https://www.purewow.com/wellness/mbti-questions](https://www.purewow.com/wellness/mbti-questions)  
36. Free Myers Briggs (MBTI test) 16 personalities types style test by 123test.com, 3月 22, 2026にアクセス、 [https://www.123test.com/jung-personality-test/](https://www.123test.com/jung-personality-test/)  
37. MBTI Type Dynamics—How Your 4 Letters Interact \- Myers & Briggs Foundation, 3月 22, 2026にアクセス、 [https://www.myersbriggs.org/unique-features-of-myers-briggs/type-dynamics-overview/](https://www.myersbriggs.org/unique-features-of-myers-briggs/type-dynamics-overview/)  
38. The comforting pseudoscience of the MBTI \- Ness Labs, 3月 22, 2026にアクセス、 [https://nesslabs.com/mbti](https://nesslabs.com/mbti)  
39. MBTI Personality Test | Maximus Veritas, 3月 22, 2026にアクセス、 [https://www.maximusveritas.com/wp-content/uploads/2017/07/MBTI-Personality-Type-Test.pdf](https://www.maximusveritas.com/wp-content/uploads/2017/07/MBTI-Personality-Type-Test.pdf)  
40. MBTI Scoring Guide and Sheet | PDF \- Scribd, 3月 22, 2026にアクセス、 [https://www.scribd.com/document/897620139/MBTI-Scoring-2](https://www.scribd.com/document/897620139/MBTI-Scoring-2)  
41. How to create a personality test with score/letter logic (with multiple personalities results), 3月 22, 2026にアクセス、 [https://community.typeform.com/build-your-typeform-7/how-to-create-a-personality-test-with-score-letter-logic-with-multiple-personalities-results-8806](https://community.typeform.com/build-your-typeform-7/how-to-create-a-personality-test-with-score-letter-logic-with-multiple-personalities-results-8806)  
42. Highest-Scoring Category & Personality-Style Quizzes \- ScoreApp Help Centre, 3月 22, 2026にアクセス、 [https://support.scoreapp.com/article/147-highest-scoring-category-personality-style-quizzes](https://support.scoreapp.com/article/147-highest-scoring-category-personality-style-quizzes)  
43. Understand and Apply the Value of your MBTI Type \- Myers & Briggs Foundation, 3月 22, 2026にアクセス、 [https://www.myersbriggs.org/my-mbti-personality-type/my-mbti-results/](https://www.myersbriggs.org/my-mbti-personality-type/my-mbti-results/)  
44. MBTI Step 1, 2, 3—show your unique type expression \- Myers & Briggs Foundation, 3月 22, 2026にアクセス、 [https://www.myersbriggs.org/unique-features-of-myers-briggs/three-unique-instruments/](https://www.myersbriggs.org/unique-features-of-myers-briggs/three-unique-instruments/)  
45. Your top Myers Briggs personality type relationship questions answered \- MBTIonline, 3月 22, 2026にアクセス、 [https://www.mbtionline.com/en-US/Articles/your-top-myers-briggs-personality-type-relationship-questions-answered](https://www.mbtionline.com/en-US/Articles/your-top-myers-briggs-personality-type-relationship-questions-answered)  
46. Personality Identity Estimator, PIE, 3月 22, 2026にアクセス、 [https://psytests.org/typo/mbtipieen.html](https://psytests.org/typo/mbtipieen.html)  
47. Sample Behavioral Interview Questions \- Career Services \- myUSF, 3月 22, 2026にアクセス、 [https://myusf.usfca.edu/career-services/career-resources/interviews-offers/interviews/sample-behavioral-questions](https://myusf.usfca.edu/career-services/career-resources/interviews-offers/interviews/sample-behavioral-questions)  
48. 26 of the Best Personality Test Questions | Indeed.com, 3月 22, 2026にアクセス、 [https://www.indeed.com/career-advice/career-development/best-personality-test-questions](https://www.indeed.com/career-advice/career-development/best-personality-test-questions)  
49. Psychometric Properties of a Test: Validity, Reliability and Norms \- Xobin, 3月 22, 2026にアクセス、 [https://xobin.com/blog/psychometric-properties-of-a-test/](https://xobin.com/blog/psychometric-properties-of-a-test/)

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAYCAYAAABjswTDAAACRUlEQVR4Xu2WTYiNYRTH//I1GR8pCSP5nAUWihgLLLCRyEY28tVYIAuhGDNsjZK1QpqRSCRKyEKzYEVWonxlNZPFDBob4f/vnGc687gz3Wku7yzur371nHOf997zPp8XqFKlyn9jA31bptv9mcIYRSfQh/Q33UjH03Gen0EP0Z90qz9TOJ30Gx2bf+C8oMvyZBEsho3qgyy/KrQf06khLowDsGKPh9w0+ijEJ0O7UG7Cit1G59PV9Ck9HTuNFLroD9pBn9PPsOLXxU4jgSWwwu6HXC39AjsVxBjYskjoBJHlUG7fubAT6VmW74eOJRV7NOT05XdCfJDuC/E1uinEgzGUvsfo5TwZuQUrdkX+gaOj7CXszBUaZR1xM/t6DMxQ+grN7q48mdAIarq/0tHZZ4kz9Ly399IrtJdeoLM9L1bSs7DRqcHAfdMlo9laQ6d7Xr/fQ+d4/BfLUfp8FbNoG/1FF3pOo9xCL8IKSlyFLSON5H5YcaX61sFmSd+9APbb2jNCM/ve2/3QLn8He2s9oJPgE/1AP8JOBxWpK/auPdKHXmxHiNfDCkhspq+8nfe9DpspMQ82q2nz6WUvebsiaOS0ZOIa1MXRFOJzsBnJ++q/xne61uPd9La3xT26M8TDRlOlf1/iFGzT6ULZ47l6+hp2fed9J8JGcornVOgResLjbtiFVLGbUmvuDW2lWzy3lN6gjbDCGzxfqu9h2K2ogrSu22EbUTyhzXSRxxVBmyVdFpE0YpFSfSfBloiIm1RMzuIq/4w/sbt0vwqpsG8AAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAYCAYAAABnRtT+AAACPUlEQVR4Xu2WTYiOURTHD+Nj5HuBolhIFkghQkpsfNSIQlkoH4XF+EpY2LEjkshHYWFjYWcjI4myETaihFlQYmGmFAtfv3/nufPeOe87bzNj6qHef/2a5577n6d733vOuY9ZQw39PxoEy2AeNBexyTCiy1GydsA9OAe34SNshtcwOvOVpsPwGMZlsRnwC55ksdI0C37CnDiBHsGpGCxD+hV/w6g4YX70a2OwDJ03X+RxGBzm8gIqVS3mixSf4SZsg+G5qWyp7RyAb1ZZrLgLQzLfP6GRsAbOwHfzha7q5qhOh3rqrXcfvIMNcSJpbgwU2mO+SP1NUvU/yMb11BdvE3TC1DghTTJv3rW02HyR87PYEbiYjeupL94F8DYGkzbBG/OdRJ01PwId2RQ4DS/hPuzMfEqRg+a9VBuq551tvviNsNq8FqRDcDWZoi6Y/1pbQ3wpfDFvP5JeNga+wjQYWsQXQhvMNN9MO0zowbsS7ph3jO3wqYhLuoLjGrr0FFrhBTyDk3ADnlt1wSyCVyH2ENZlY12f663aqw18gOXFWO3tVvGsU+ywHvJR0sukYeZfPvrnFZXpbtIxXcrGS8xbVkqVsfADplu1Vycjb+q712Fv8awUUcoNiHQkW8x3vNv8vm/P5tW2UqFErzqITkrSJ99788Udhf1wDXbBxMLTbykV9LLLVrkmVSzH4IR5saS+GL3KaT2rH8qvG+2Kec4rV7WpvNX9lXSkUaruWt2hlnd89px/D6jQUqU3NOD6A9oRaGjkgt2RAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAYCAYAAACIhL/AAAACEUlEQVR4Xu2WS0hVURSGl6mkkQpB4DPUVKQSHWjUUESCFHPoRFLBBwTSQFHyMXCmTZo4MTIiGiiCYFE+kBzpQCEapaIiKkREYAo6zH+xlrpdngvHK14b3A8+2HutdTj77te5RGHChPHFQzjvw1n4FebLY6HjNfwGy2AaTIST8B+shDc1/lRjWfJYaIiCS/CGif+EuyR5ly0YaWIXSinsNbFckpn6YuJX4IKJXTg18LaJNZEMsM3E42CHiV0KQyQDvG8T/wu/4A6FeK/55S7J7H22CYcI1Q9+a9PhBJwz8VM8Ixlgq004fICPbTAAZ6nldw7aoGWEZIBFNqHwtcPXT5JNeHCWWuYTyV0bEF6K3xR4/9XBt3APvoKpTo4PFF9XPAsxFLg2FlbDdlgICzTO7/sLb2nfE34Jz96UTSjRsBsOkAzikHewhWTGGkgG5FXL+XH4CF6DiyRbiuHBrmn7BMlwFa6TzNy+uglXYMZRpcCXd5XTLyH5TB5SDr9r29Y2whmnvwHztM0/8I2TCwqeAf4R7p7ib7Z7eb+E78m7lleGZ5VJh3/o+IR/JFn6c8HLsKztTpJlGoa1GsuBP+Ad8q4dhU801gzHSGaYV2kbZsIXmg+KFJI/Fn2wQmP3SL489SSDfaBxr9pi2A+fwx6S/diluWltZ2s/aHjDX7VBkGAD5F3Lh+e6tt2DxsSbfphzcwD9kGg4xyp5IwAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAYCAYAAACIhL/AAAAB7ElEQVR4Xu2VPUgcQRTH/34EFUGTwoAfKJLCQDAISiJipYWFhWihmCJViEkRlSAo+FFJmgS1VAvFOm0KEVHUUisbRdBcIGWKiJJAEPT/fDO52TnvuDstVtgf/GDnvbe7sztvdoGIiIisWaU/aIx+N8drbkFY+EovaZefCAtH9Izm+4kwUA59e7LcoaQfOsExPxEW5qETbPYTYeEQ97T/cv1ACtKtHYJ+znr8RDJs/4168Xq65cWSkUltHj2l1X7C0oDgUi5CJ/jCiQkyYenNdMiktome+EGLnUyvGT+A/jl+Qp9MqKQz9IBu0jcmLhTTj/QLbUTq2g46SVtpmxMfoUvOOMAu3acVZjxF/9GW/xVADi2h57QG+hCCvOF1WgfttxgtS1Ir1/0EvdYK9C9l+UZfO+MAfXSbvoWe+As3F7+E7myXHQR/g3u0G4m1T+kfWmTGcp8P5lhW6TdS9J/wCLrEnfShl7NITy04Y3nDfxFvg1J6QZ8gsXacbjjjGH1ujqUtjuOp7JFleAV90nf0GfRGllnEN4VfK58RyQsyMXljtaZmmC7TAfrY1GTFZ+iFZFMVmphsjAk6Dd0Y9rvn11aZ8SD01yktNWdy7dAHen995i2RZfSRXWyX2eWmWmklQTZKgROXTSWxiDvlCu93XJOa7uGRAAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,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>