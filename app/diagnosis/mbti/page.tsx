import type { Metadata } from "next";
import { MbtiQuiz } from "./components/MbtiQuiz";

export const metadata: Metadata = {
  title: "MBTI簡易診断 | COCOSiL",
  description: "60問の質問に答えて、あなたのMBTIタイプを発見しましょう。",
};

export default function MbtiDiagnosisPage() {
  return (
    <div className="mbti-page-shell" style={{ background: "#faf9ff", paddingTop: "3rem" }}>
      <MbtiQuiz />
    </div>
  );
}
