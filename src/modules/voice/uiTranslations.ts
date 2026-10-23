import type { VoiceLanguage } from './voiceMessages';

const uiTranslations: Record<VoiceLanguage, Record<string, string>> = {
  'en-IN': {
    language: 'Language', voiceMissing: 'No local voice is installed and cloud speech is not configured. Configure server-side cloud TTS or install a {language} voice.',
    journey: 'Travel & Journey', scanner: 'Bus Board OCR', verify: 'Verify Suite', repeat: 'Repeat last announcement',
    textSize: 'Change text size', contrast: 'Toggle high contrast', mute: 'Mute speech', enableSpeech: 'Enable speech',
    emergency: 'Emergency assistance', routeTitle: 'Available routes to "{destination}"',
    noRoutes: 'No matching demonstration routes found. Try searching for "Hazratganj".',
    routesFound: 'Found {count} demonstration transit routes.',
    tryAnother: 'Try another destination', from: 'From:', to: 'To:', every: 'Every {minutes} mins',
    stops: '{count} stops', listen: 'Listen', selectRoute: 'Select Route',
  },
  'hi-IN': {
    language: 'भाषा', voiceMissing: 'डिवाइस में आवाज़ नहीं है और सर्वर पर क्लाउड आवाज़ सेट नहीं है। क्लाउड TTS सेट करें या {language} आवाज़ इंस्टॉल करें।',
    journey: 'यात्रा', scanner: 'बस बोर्ड स्कैन', verify: 'जाँचें', repeat: 'पिछली घोषणा दोहराएँ',
    textSize: 'पाठ का आकार बदलें', contrast: 'हाई कॉन्ट्रास्ट बदलें', mute: 'आवाज़ बंद करें', enableSpeech: 'आवाज़ चालू करें',
    emergency: 'आपातकालीन सहायता', routeTitle: '"{destination}" के लिए उपलब्ध मार्ग',
    noRoutes: 'कोई मार्ग नहीं मिला। "हज़रतगंज" खोजकर देखें।',
    routesFound: '{count} बस मार्ग मिले।',
    tryAnother: 'दूसरा गंतव्य खोजें', from: 'यहाँ से:', to: 'यहाँ तक:', every: 'हर {minutes} मिनट',
    stops: '{count} स्टॉप', listen: 'सुनें', selectRoute: 'मार्ग चुनें',
  },
  'bn-IN': {
    language: 'ভাষা', voiceMissing: 'ডিভাইসে কণ্ঠস্বর নেই এবং সার্ভারে ক্লাউড কণ্ঠস্বর সেট করা নেই। ক্লাউড TTS সেট করুন বা {language} কণ্ঠস্বর ইনস্টল করুন।',
    journey: 'যাত্রা', scanner: 'বাস বোর্ড স্ক্যান', verify: 'যাচাই', repeat: 'আগের ঘোষণা শুনুন',
    textSize: 'লেখার আকার বদলান', contrast: 'উচ্চ কনট্রাস্ট বদলান', mute: 'কথা বন্ধ করুন', enableSpeech: 'কথা চালু করুন',
    emergency: 'জরুরি সহায়তা', routeTitle: '"{destination}"-এর উপলভ্য পথ',
    noRoutes: 'কোনো পথ মেলেনি। "হজরতগঞ্জ" খুঁজে দেখুন।',
    routesFound: '{count}টি বাসের পথ পাওয়া গেছে।',
    tryAnother: 'অন্য গন্তব্য খুঁজুন', from: 'থেকে:', to: 'পর্যন্ত:', every: 'প্রতি {minutes} মিনিটে',
    stops: '{count}টি স্টপ', listen: 'শুনুন', selectRoute: 'পথ বেছে নিন',
  },
  'mr-IN': {
    language: 'भाषा', voiceMissing: 'उपकरणात आवाज नाही आणि सर्व्हरवर क्लाउड आवाज सेट केलेला नाही. क्लाउड TTS सेट करा किंवा {language} आवाज स्थापित करा.',
    journey: 'प्रवास', scanner: 'बस बोर्ड स्कॅन', verify: 'तपासा', repeat: 'मागील सूचना पुन्हा ऐका',
    textSize: 'मजकुराचा आकार बदला', contrast: 'कॉन्ट्रास्ट बदला', mute: 'आवाज बंद करा', enableSpeech: 'आवाज सुरू करा',
    emergency: 'आपत्कालीन मदत', routeTitle: '"{destination}" साठी उपलब्ध मार्ग',
    noRoutes: 'मार्ग सापडला नाही. "हजरतगंज" शोधून पाहा.',
    routesFound: '{count} बस मार्ग सापडले.',
    tryAnother: 'दुसरे ठिकाण शोधा', from: 'पासून:', to: 'पर्यंत:', every: 'दर {minutes} मिनिटांनी',
    stops: '{count} थांबे', listen: 'ऐका', selectRoute: 'मार्ग निवडा',
  },
  'ta-IN': {
    language: 'மொழி', voiceMissing: 'சாதனத்தில் குரல் இல்லை; சேவையகத்தில் மேகக் குரலும் அமைக்கப்படவில்லை. கிளவுட் TTS அமைக்கவும் அல்லது {language} குரலை நிறுவவும்.',
    journey: 'பயணம்', scanner: 'பேருந்து பலகை ஸ்கேன்', verify: 'சரிபார்க்கவும்', repeat: 'முந்தைய அறிவிப்பை மீண்டும் கேட்கவும்',
    textSize: 'எழுத்து அளவை மாற்றவும்', contrast: 'மாறுபாட்டை மாற்றவும்', mute: 'குரலை அணைக்கவும்', enableSpeech: 'குரலை இயக்கவும்',
    emergency: 'அவசர உதவி', routeTitle: '"{destination}" செல்லும் வழிகள்',
    noRoutes: 'வழிகள் இல்லை. "ஹஸ்ரத்கஞ்ச்" தேடவும்.',
    routesFound: '{count} பேருந்து வழிகள் கிடைத்தன.',
    tryAnother: 'வேறு சேருமிடத்தைத் தேடவும்', from: 'இருந்து:', to: 'வரை:', every: 'ஒவ்வொரு {minutes} நிமிடத்திற்கும்',
    stops: '{count} நிறுத்தங்கள்', listen: 'கேட்கவும்', selectRoute: 'வழியைத் தேர்ந்தெடுக்கவும்',
  },
  'te-IN': {
    language: 'భాష', voiceMissing: 'పరికరంలో వాయిస్ లేదు, సర్వర్‌లో క్లౌడ్ వాయిస్ సెటప్ కాలేదు. క్లౌడ్ TTS సెటప్ చేయండి లేదా {language} వాయిస్ ఇన్‌స్టాల్ చేయండి.',
    journey: 'ప్రయాణం', scanner: 'బస్సు బోర్డు స్కాన్', verify: 'తనిఖీ', repeat: 'మునుపటి ప్రకటన వినండి',
    textSize: 'అక్షర పరిమాణం మార్చండి', contrast: 'కాంట్రాస్ట్ మార్చండి', mute: 'వాయిస్ ఆపండి', enableSpeech: 'వాయిస్ ప్రారంభించండి',
    emergency: 'అత్యవసర సహాయం', routeTitle: '"{destination}"కు అందుబాటులో ఉన్న మార్గాలు',
    noRoutes: 'మార్గాలు దొరకలేదు. "హజ్రత్‌గంజ్" కోసం వెతకండి.',
    routesFound: '{count} బస్సు మార్గాలు దొరికాయి.',
    tryAnother: 'వేరే గమ్యస్థానం వెతకండి', from: 'నుంచి:', to: 'వరకు:', every: 'ప్రతి {minutes} నిమిషాలకు',
    stops: '{count} స్టాప్‌లు', listen: 'వినండి', selectRoute: 'మార్గం ఎంచుకోండి',
  },
  'kn-IN': {
    language: 'ಭಾಷೆ', voiceMissing: 'ಸಾಧನದಲ್ಲಿ ಧ್ವನಿ ಇಲ್ಲ ಮತ್ತು ಸರ್ವರ್‌ನಲ್ಲಿ ಕ್ಲೌಡ್ ಧ್ವನಿ ಹೊಂದಿಸಿಲ್ಲ. ಕ್ಲೌಡ್ TTS ಹೊಂದಿಸಿ ಅಥವಾ {language} ಧ್ವನಿ ಸ್ಥಾಪಿಸಿ.',
    journey: 'ಪ್ರಯಾಣ', scanner: 'ಬಸ್ ಫಲಕ ಸ್ಕ್ಯಾನ್', verify: 'ಪರಿಶೀಲಿಸಿ', repeat: 'ಹಿಂದಿನ ಪ್ರಕಟಣೆ ಕೇಳಿ',
    textSize: 'ಪಠ್ಯದ ಗಾತ್ರ ಬದಲಿಸಿ', contrast: 'ಕಾಂಟ್ರಾಸ್ಟ್ ಬದಲಿಸಿ', mute: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ', enableSpeech: 'ಧ್ವನಿ ಆರಂಭಿಸಿ',
    emergency: 'ತುರ್ತು ಸಹಾಯ', routeTitle: '"{destination}"ಗೆ ಲಭ್ಯವಿರುವ ಮಾರ್ಗಗಳು',
    noRoutes: 'ಮಾರ್ಗಗಳು ಸಿಗಲಿಲ್ಲ. "ಹಜರತ್‌ಗಂಜ್" ಹುಡುಕಿ.',
    routesFound: '{count} ಬಸ್ ಮಾರ್ಗಗಳು ಕಂಡುಬಂದಿವೆ.',
    tryAnother: 'ಬೇರೆ ಗಮ್ಯಸ್ಥಾನ ಹುಡುಕಿ', from: 'ಇಂದ:', to: 'ವರೆಗೆ:', every: 'ಪ್ರತಿ {minutes} ನಿಮಿಷಕ್ಕೆ',
    stops: '{count} ನಿಲ್ದಾಣಗಳು', listen: 'ಕೇಳಿ', selectRoute: 'ಮಾರ್ಗ ಆಯ್ಕೆಮಾಡಿ',
  },
  'ml-IN': {
    language: 'ഭാഷ', voiceMissing: 'ഉപകരണത്തിൽ ശബ്ദമില്ല, സെർവറിൽ ക്ലൗഡ് ശബ്ദവും സജ്ജമാക്കിയിട്ടില്ല. ക്ലൗഡ് TTS സജ്ജമാക്കുകയോ {language} ശബ്ദം ഇൻസ്റ്റാൾ ചെയ്യുകയോ ചെയ്യുക.',
    journey: 'യാത്ര', scanner: 'ബസ് ബോർഡ് സ്കാൻ', verify: 'പരിശോധിക്കുക', repeat: 'കഴിഞ്ഞ അറിയിപ്പ് വീണ്ടും കേൾക്കുക',
    textSize: 'അക്ഷര വലുപ്പം മാറ്റുക', contrast: 'കോൺട്രാസ്റ്റ് മാറ്റുക', mute: 'ശബ്ദം നിർത്തുക', enableSpeech: 'ശബ്ദം ആരംഭിക്കുക',
    emergency: 'അടിയന്തര സഹായം', routeTitle: '"{destination}"-ലേക്കുള്ള വഴികൾ',
    noRoutes: 'വഴികൾ കണ്ടെത്തിയില്ല. "ഹസ്രത്ഗഞ്ച്" തിരയുക.',
    routesFound: '{count} ബസ് വഴികൾ കണ്ടെത്തി.',
    tryAnother: 'മറ്റൊരു ലക്ഷ്യസ്ഥാനം തിരയുക', from: 'ഇവിടെ നിന്ന്:', to: 'ഇവിടേക്ക്:', every: 'ഓരോ {minutes} മിനിറ്റിലും',
    stops: '{count} സ്റ്റോപ്പുകൾ', listen: 'കേൾക്കുക', selectRoute: 'വഴി തിരഞ്ഞെടുക്കുക',
  },
  'gu-IN': {
    language: 'ભાષા', voiceMissing: 'ઉપકરણમાં અવાજ નથી અને સર્વર પર ક્લાઉડ અવાજ સેટ નથી. ક્લાઉડ TTS સેટ કરો અથવા {language} અવાજ ઇન્સ્ટોલ કરો.',
    journey: 'મુસાફરી', scanner: 'બસ બોર્ડ સ્કેન', verify: 'ચકાસો', repeat: 'છેલ્લી જાહેરાત ફરી સાંભળો',
    textSize: 'લખાણનું કદ બદલો', contrast: 'કોન્ટ્રાસ્ટ બદલો', mute: 'અવાજ બંધ કરો', enableSpeech: 'અવાજ ચાલુ કરો',
    emergency: 'કટોકટી સહાય', routeTitle: '"{destination}" માટે ઉપલબ્ધ માર્ગો',
    noRoutes: 'માર્ગ મળ્યો નથી. "હઝરતગંજ" શોધી જુઓ.',
    routesFound: '{count} બસ માર્ગ મળ્યા.',
    tryAnother: 'બીજું ગંતવ્ય શોધો', from: 'થી:', to: 'સુધી:', every: 'દર {minutes} મિનિટે',
    stops: '{count} સ્ટોપ', listen: 'સાંભળો', selectRoute: 'માર્ગ પસંદ કરો',
  },
  'pa-IN': {
    language: 'ਭਾਸ਼ਾ', voiceMissing: 'ਡਿਵਾਈਸ ਵਿੱਚ ਆਵਾਜ਼ ਨਹੀਂ ਅਤੇ ਸਰਵਰ ਉੱਤੇ ਕਲਾਉਡ ਆਵਾਜ਼ ਸੈੱਟ ਨਹੀਂ। ਕਲਾਉਡ TTS ਸੈੱਟ ਕਰੋ ਜਾਂ {language} ਆਵਾਜ਼ ਇੰਸਟਾਲ ਕਰੋ।',
    journey: 'ਸਫ਼ਰ', scanner: 'ਬੱਸ ਬੋਰਡ ਸਕੈਨ', verify: 'ਜਾਂਚੋ', repeat: 'ਪਿਛਲੀ ਸੂਚਨਾ ਮੁੜ ਸੁਣੋ',
    textSize: 'ਲਿਖਤ ਦਾ ਆਕਾਰ ਬਦਲੋ', contrast: 'ਕੰਟਰਾਸਟ ਬਦਲੋ', mute: 'ਆਵਾਜ਼ ਬੰਦ ਕਰੋ', enableSpeech: 'ਆਵਾਜ਼ ਚਾਲੂ ਕਰੋ',
    emergency: 'ਐਮਰਜੈਂਸੀ ਸਹਾਇਤਾ', routeTitle: '"{destination}" ਲਈ ਉਪਲਬਧ ਰਸਤੇ',
    noRoutes: 'ਕੋਈ ਰਸਤਾ ਨਹੀਂ ਮਿਲਿਆ। "ਹਜ਼ਰਤਗੰਜ" ਲੱਭੋ।',
    routesFound: '{count} ਬੱਸ ਰਸਤੇ ਮਿਲੇ।',
    tryAnother: 'ਹੋਰ ਮੰਜ਼ਿਲ ਲੱਭੋ', from: 'ਤੋਂ:', to: 'ਤੱਕ:', every: 'ਹਰ {minutes} ਮਿੰਟ ਬਾਅਦ',
    stops: '{count} ਸਟਾਪ', listen: 'ਸੁਣੋ', selectRoute: 'ਰਸਤਾ ਚੁਣੋ',
  },
};

type UiMessage = keyof (typeof uiTranslations)['en-IN'];

export function getUiMessage(
  language: VoiceLanguage,
  key: UiMessage,
  parameters: Record<string, string | number> = {}
): string {
  const template = uiTranslations[language][key];
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    String(parameters[name] ?? placeholder)
  );
}
