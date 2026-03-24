import type { Metadata } from "next";
import { MbtiQuiz } from "./components/MbtiQuiz";

export const metadata: Metadata = {
  title: "MBTI簡易診断 | COCOSiL",
  description:
    "12問の簡単な質問に答えて、あなたのMBTIタイプを発見しましょう。自分の性格タイプを知ることで、人間関係やコミュニケーションのヒントが見つかります。",
};

export default function MbtiDiagnosisPage() {
  return (
    <div className="mbti-page">
      <header className="mbti-header">
        <h1 className="mbti-heading">
          <span className="heading-accent">MBTI</span> 簡易診断
        </h1>
        <p className="mbti-subheading">
          12問の質問に答えて、あなたの性格タイプを見つけましょう
        </p>
      </header>
      <MbtiQuiz />
    </div>
  );
}
