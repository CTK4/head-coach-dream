import { PressableButtonDemo } from "@/components/pressable/PressableButton";

const PressFeedbackDemo = () => {
  return (
    <main className="grid gap-4 p-8">
      <h1 className="text-xl font-bold">Press Feedback Demo</h1>
      <p className="text-slate-500">
        Touch, mouse, and keyboard interactions all show immediate press feedback.
      </p>
      <PressableButtonDemo />
    </main>
  );
};

export default PressFeedbackDemo;
