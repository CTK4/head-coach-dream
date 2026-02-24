import { PressableButtonDemo } from "@/components/pressable/PressableButton";

const PressFeedbackDemo = () => {
  return (
    <main style={{ padding: "2rem", display: "grid", gap: "1rem" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Press Feedback Demo</h1>
      <p style={{ color: "#475569", margin: 0 }}>
        Touch, mouse, and keyboard interactions all show immediate press feedback.
      </p>
      <PressableButtonDemo />
    </main>
  );
};

export default PressFeedbackDemo;
