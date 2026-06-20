import type { Language } from "@/context/AppContext";

const LANG_TO_BCP: Record<Language, string> = {
  en: "en-IN", hi: "hi-IN", mr: "mr-IN", ta: "ta-IN", kn: "kn-IN", te: "te-IN", bn: "bn-IN",
};

export function announce(text: string, language: Language = "en"): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG_TO_BCP[language] ?? "en-IN";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function stopAnnounce() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}