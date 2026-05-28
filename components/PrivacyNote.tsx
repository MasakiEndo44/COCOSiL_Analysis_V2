export function PrivacyNote() {
  return (
    <div className="flex items-center gap-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="#b0aec8" strokeWidth="1.5"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#b0aec8" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span className="text-xs text-[#b0aec8]">入力内容は、あなたを理解するためだけに使われます</span>
    </div>
  );
}
