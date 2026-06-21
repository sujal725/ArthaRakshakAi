import type { Language } from "@/context/AppContext";

const LANG_TO_BCP: Record<Language, string> = {
  en: "en-IN", hi: "hi-IN", mr: "mr-IN", ta: "ta-IN", kn: "kn-IN", te: "te-IN", bn: "bn-IN",
};

export function announce(text: string, language: Language = "en"): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const targetLang = LANG_TO_BCP[language] ?? "en-IN";

    let spoken = false;
    const speak = () => {
      if (spoken) return;
      spoken = true;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = targetLang;
      u.rate = 0.95;
      const voices = synth.getVoices();
      const match =
        voices.find((v) => v.lang === targetLang) ??
        voices.find((v) => v.lang.toLowerCase().startsWith(targetLang.split("-")[0].toLowerCase()));
      if (match) u.voice = match;
      synth.speak(u);
    };

    if (synth.getVoices().length === 0) {
      synth.addEventListener("voiceschanged", speak, { once: true });
      setTimeout(speak, 300); // fallback if the event never fires
    } else {
      speak();
    }
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