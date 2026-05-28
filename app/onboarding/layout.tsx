export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100dvh", background: "#faf9ff", color: "#1e1a3c" }}>
      {children}
    </div>
  );
}
