import React from 'react';
import { Volume2 } from 'lucide-react';
import { VOICE_LANGUAGES, type VoiceLanguage } from '../modules/voice/voiceMessages';

const languages: Record<VoiceLanguage, {
  name: string;
  title: string;
  instruction: string;
  hint: string;
  voiceWarning: string;
  checkingVoice: string;
}> = {
  'en-IN': {
    name: 'English',
    title: 'Choose your language',
    instruction: 'Select a language to hear a welcome and use Drishti AI in that language.',
    hint: 'Selecting a language speaks the welcome message and opens the website.',
    voiceWarning: 'No local {language} voice is installed and cloud speech is not configured on the server.',
    checkingVoice: 'Checking speech service...',
  },
  'hi-IN': {
    name: 'हिन्दी',
    title: 'अपनी भाषा चुनें',
    instruction: 'स्वागत संदेश सुनने और दृष्टि एआई का उपयोग करने के लिए भाषा चुनें।',
    hint: 'भाषा चुनने पर स्वागत संदेश सुनाई देगा और वेबसाइट खुलेगी।',
    voiceWarning: 'डिवाइस में {language} आवाज़ नहीं है और सर्वर पर क्लाउड आवाज़ सेवा सेट नहीं है।',
    checkingVoice: 'आवाज़ सेवा जाँची जा रही है...',
  },
  'bn-IN': {
    name: 'বাংলা',
    title: 'আপনার ভাষা বেছে নিন',
    instruction: 'স্বাগতবার্তা শুনতে এবং দৃষ্টি এআই ব্যবহার করতে একটি ভাষা বেছে নিন।',
    hint: 'ভাষা বেছে নিলে স্বাগতবার্তা শোনা যাবে এবং ওয়েবসাইট খুলবে।',
    voiceWarning: 'ডিভাইসে {language} কণ্ঠস্বর নেই এবং সার্ভারে ক্লাউড কণ্ঠস্বর পরিষেবা সেট করা নেই।',
    checkingVoice: 'কণ্ঠস্বর পরিষেবা পরীক্ষা করা হচ্ছে...',
  },
  'mr-IN': {
    name: 'मराठी',
    title: 'तुमची भाषा निवडा',
    instruction: 'स्वागत संदेश ऐकण्यासाठी आणि दृष्टी एआय वापरण्यासाठी भाषा निवडा.',
    hint: 'भाषा निवडल्यावर स्वागत संदेश ऐकू येईल आणि वेबसाइट उघडेल.',
    voiceWarning: 'उपकरणात {language} आवाज नाही आणि सर्व्हरवर क्लाउड आवाज सेवा सेट केलेली नाही.',
    checkingVoice: 'आवाज सेवा तपासत आहोत...',
  },
  'ta-IN': {
    name: 'தமிழ்',
    title: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    instruction: 'வரவேற்பைக் கேட்கவும் திருஷ்டி ஏஐயைப் பயன்படுத்தவும் ஒரு மொழியைத் தேர்ந்தெடுக்கவும்.',
    hint: 'மொழியைத் தேர்ந்தெடுத்ததும் வரவேற்பு ஒலித்து இணையதளம் திறக்கும்.',
    voiceWarning: 'சாதனத்தில் {language} குரல் இல்லை; சேவையகத்தில் மேகக் குரல் சேவையும் அமைக்கப்படவில்லை.',
    checkingVoice: 'குரல் சேவையைச் சரிபார்க்கிறது...',
  },
  'te-IN': {
    name: 'తెలుగు',
    title: 'మీ భాషను ఎంచుకోండి',
    instruction: 'స్వాగత సందేశం వినడానికి, దృష్టి ఏఐ ఉపయోగించడానికి ఒక భాషను ఎంచుకోండి.',
    hint: 'భాషను ఎంచుకుంటే స్వాగత సందేశం వినిపించి వెబ్‌సైట్ తెరుచుకుంటుంది.',
    voiceWarning: 'పరికరంలో {language} వాయిస్ లేదు, సర్వర్‌లో క్లౌడ్ వాయిస్ కూడా సెటప్ కాలేదు.',
    checkingVoice: 'వాయిస్ సేవను తనిఖీ చేస్తున్నాం...',
  },
  'kn-IN': {
    name: 'ಕನ್ನಡ',
    title: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    instruction: 'ಸ್ವಾಗತ ಸಂದೇಶ ಕೇಳಲು ಮತ್ತು ದೃಷ್ಟಿ ಎಐ ಬಳಸಲು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    hint: 'ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿದಾಗ ಸ್ವಾಗತ ಸಂದೇಶ ಕೇಳಿಸುತ್ತದೆ ಮತ್ತು ವೆಬ್‌ಸೈಟ್ ತೆರೆಯುತ್ತದೆ.',
    voiceWarning: 'ಸಾಧನದಲ್ಲಿ {language} ಧ್ವನಿ ಇಲ್ಲ ಮತ್ತು ಸರ್ವರ್‌ನಲ್ಲಿ ಕ್ಲೌಡ್ ಧ್ವನಿ ಹೊಂದಿಸಲಾಗಿಲ್ಲ.',
    checkingVoice: 'ಧ್ವನಿ ಸೇವೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
  },
  'ml-IN': {
    name: 'മലയാളം',
    title: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക',
    instruction: 'സ്വാഗത സന്ദേശം കേൾക്കാനും ദൃഷ്ടി എഐ ഉപയോഗിക്കാനും ഒരു ഭാഷ തിരഞ്ഞെടുക്കുക.',
    hint: 'ഭാഷ തിരഞ്ഞെടുത്താൽ സ്വാഗത സന്ദേശം കേൾക്കുകയും വെബ്‌സൈറ്റ് തുറക്കുകയും ചെയ്യും.',
    voiceWarning: 'ഉപകരണത്തിൽ {language} ശബ്ദമില്ല; സെർവറിൽ ക്ലൗഡ് ശബ്ദ സേവനവും സജ്ജമാക്കിയിട്ടില്ല.',
    checkingVoice: 'ശബ്ദ സേവനം പരിശോധിക്കുന്നു...',
  },
  'gu-IN': {
    name: 'ગુજરાતી',
    title: 'તમારી ભાષા પસંદ કરો',
    instruction: 'સ્વાગત સંદેશ સાંભળવા અને દૃષ્ટિ એઆઈ વાપરવા માટે ભાષા પસંદ કરો.',
    hint: 'ભાષા પસંદ કરતાં સ્વાગત સંદેશ સંભળાશે અને વેબસાઇટ ખુલશે.',
    voiceWarning: 'ઉપકરણમાં {language} અવાજ નથી અને સર્વર પર ક્લાઉડ અવાજ સેવા સેટ નથી.',
    checkingVoice: 'અવાજ સેવા તપાસી રહ્યા છીએ...',
  },
  'pa-IN': {
    name: 'ਪੰਜਾਬੀ',
    title: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',
    instruction: 'ਸੁਆਗਤ ਸੁਨੇਹਾ ਸੁਣਨ ਅਤੇ ਦ੍ਰਿਸ਼ਟੀ ਏਆਈ ਵਰਤਣ ਲਈ ਭਾਸ਼ਾ ਚੁਣੋ।',
    hint: 'ਭਾਸ਼ਾ ਚੁਣਨ ਨਾਲ ਸੁਆਗਤ ਸੁਨੇਹਾ ਸੁਣੇਗਾ ਅਤੇ ਵੈੱਬਸਾਈਟ ਖੁੱਲ੍ਹੇਗੀ।',
    voiceWarning: 'ਡਿਵਾਈਸ ਵਿੱਚ {language} ਆਵਾਜ਼ ਨਹੀਂ ਅਤੇ ਸਰਵਰ ਉੱਤੇ ਕਲਾਉਡ ਆਵਾਜ਼ ਸੇਵਾ ਸੈੱਟ ਨਹੀਂ ਹੈ।',
    checkingVoice: 'ਆਵਾਜ਼ ਸੇਵਾ ਦੀ ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ...',
  },
};

interface LanguageSelectionScreenProps {
  selectedLanguage: VoiceLanguage;
  hasVoice: boolean | null;
  cloudTtsConfigured: boolean | null;
  onSelectLanguage: (language: VoiceLanguage) => void;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  selectedLanguage,
  hasVoice,
  cloudTtsConfigured,
  onSelectLanguage,
}) => {
  const copy = languages[selectedLanguage];

  return (
    <main
      lang={selectedLanguage}
      className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-white"
    >
      <section className="w-full max-w-3xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:p-10">
        <header className="space-y-3 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
            Drishti AI
          </p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{copy.title}</h1>
          <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
            {copy.instruction}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {VOICE_LANGUAGES.map((language) => {
            const option = languages[language];
            const isSelected = language === selectedLanguage;

            return (
              <button
                key={language}
                type="button"
                lang={language}
                aria-pressed={isSelected}
                onClick={() => onSelectLanguage(language)}
                className={`flex min-h-16 items-center justify-between rounded-xl border-2 px-5 py-4 text-left text-lg font-semibold transition-colors focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-500 ${
                  isSelected
                    ? 'border-violet-600 bg-violet-50 text-violet-950 dark:bg-violet-950 dark:text-violet-100'
                    : 'border-slate-200 hover:border-violet-400 dark:border-slate-700 dark:hover:border-violet-500'
                }`}
              >
                <span>{option.name}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {language}
                </span>
              </button>
            );
          })}
        </div>

        {hasVoice === false && cloudTtsConfigured === null ? (
          <p role="status" className="text-center text-sm text-slate-500">
            {copy.checkingVoice}
          </p>
        ) : hasVoice === false && cloudTtsConfigured === false ? (
          <p role="status" className="text-center text-sm text-amber-700 dark:text-amber-300">
            {copy.voiceWarning.replace('{language}', copy.name)}
          </p>
        ) : null}

        <p className="flex items-center justify-center gap-2 text-center text-sm text-slate-500 dark:text-slate-400">
          <Volume2 size={18} aria-hidden="true" />
          {copy.hint}
        </p>
      </section>
    </main>
  );
};
