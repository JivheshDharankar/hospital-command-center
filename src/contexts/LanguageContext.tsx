import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Translation types
export type Language = 'en' | 'hi' | 'mr';

interface Translations {
  [key: string]: string | Translations;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; name: string; nativeName: string }[];
}

const languages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'hi' as Language, name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr' as Language, name: 'Marathi', nativeName: 'मराठी' },
];

// Translations
const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      symptomChecker: 'Symptom Checker',
      nearbyHospitals: 'Nearby Hospitals',
      contact: 'Contact',
      analytics: 'Analytics',
      patients: 'Patients',
      commandCenter: 'Command Center',
      dispatch: 'Dispatch',
      transfers: 'Transfers',
      openDemo: 'Open Demo',
      backToHome: 'Back to Home',
    },
    hero: {
      badge: 'AI-Assisted Hospital Operations',
      title: 'Operational Command',
      subtitle: 'Live queues, bed status, and risk-based triage in one intuitive dashboard.',
      viewDashboard: 'View Live Dashboard',
      trySymptomChecker: 'Try Symptom Checker',
      startTour: 'Start Tour',
      realTimeTriage: 'Real-time Triage',
      secure: 'Secure & HIPAA Ready',
      aiPowered: 'AI-Powered Insights',
    },
    symptomChecker: {
      title: 'Patient Symptom Checker',
      subtitle: 'AI-powered triage demo. Not for clinical use; consult qualified clinicians.',
      placeholder: 'Describe your symptoms (e.g., severe chest pain, shortness of breath...)',
      describeSymptoms: 'Describe Your Symptoms',
      analyze: 'Analyse Symptoms',
      analyzing: 'Analyzing...',
      voiceInput: 'Voice Input',
      stopRecording: 'Stop Recording',
      startRecording: 'Start Recording',
      riskLevel: 'Risk Level',
      department: 'Department',
      riskSignals: 'Risk signals detected',
      whatIfAnalysis: 'What-if Analysis',
      enterSymptoms: 'Enter Symptoms',
      enterSymptomsDesc: 'Please describe your symptoms first.',
      analysisComplete: 'AI Triage Complete',
      analysisCompleteDesc: 'Symptom analysis powered by AI.',
      analysisFailed: 'Analysis Failed',
      analysisFailedDesc: 'Could not analyze symptoms. Please try again.',
      micPermission: 'Microphone Access Required',
      micPermissionDesc: 'Please enable microphone access to use voice input.',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      submit: 'Submit',
      cancel: 'Cancel',
      close: 'Close',
      next: 'Next',
      previous: 'Previous',
      skip: 'Skip',
      finish: 'Finish',
      exportPdf: 'Export PDF',
      characters: 'characters',
    },
    risk: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      emergency: 'Emergency',
    },
    walkthrough: {
      welcome: 'Welcome to MediQueue AI',
      welcomeDesc: 'Your intelligent hospital operations command center. Let us show you around!',
      dashboard: 'Live Hospital Dashboard',
      dashboardDesc: 'Monitor real-time bed availability, doctor status, and queue lengths across all hospitals.',
      symptomChecker: 'AI Symptom Checker',
      symptomCheckerDesc: 'Patients can describe symptoms and receive AI-powered triage recommendations.',
      surgeOrch: 'Surge Orchestration',
      surgeOrchDesc: 'Predictive load balancing to prevent hospital overcrowding.',
      hospitalMap: 'Geographic View',
      hospitalMapDesc: 'Visualize hospital locations, ambulance positions, and coverage areas.',
      analytics: 'Historical Analytics',
      analyticsDesc: 'Track trends in occupancy, wait times, and critical events over time.',
      complete: 'Tour Complete!',
      completeDesc: 'You\'re ready to explore MediQueue AI. Click around to discover more features!',
    },
  },
  hi: {
    nav: {
      home: 'होम',
      dashboard: 'डैशबोर्ड',
      symptomChecker: 'लक्षण जांचकर्ता',
      nearbyHospitals: 'नज़दीकी अस्पताल',
      contact: 'संपर्क',
      analytics: 'विश्लेषण',
      patients: 'मरीज़',
      commandCenter: 'कमांड सेंटर',
      dispatch: 'डिस्पैच',
      transfers: 'स्थानांतरण',
      openDemo: 'डेमो देखें',
      backToHome: 'होम पर वापस',
    },
    hero: {
      badge: 'AI-सहायता प्राप्त अस्पताल संचालन',
      title: 'ऑपरेशनल कमांड',
      subtitle: 'एक सहज डैशबोर्ड में लाइव कतार, बिस्तर की स्थिति और जोखिम-आधारित ट्राइएज।',
      viewDashboard: 'लाइव डैशबोर्ड देखें',
      trySymptomChecker: 'लक्षण जांचकर्ता आज़माएं',
      startTour: 'टूर शुरू करें',
      realTimeTriage: 'रीयल-टाइम ट्राइएज',
      secure: 'सुरक्षित और HIPAA तैयार',
      aiPowered: 'AI-संचालित अंतर्दृष्टि',
    },
    symptomChecker: {
      title: 'रोगी लक्षण जांचकर्ता',
      subtitle: 'AI-संचालित ट्राइएज डेमो। नैदानिक उपयोग के लिए नहीं; योग्य चिकित्सकों से परामर्श करें।',
      placeholder: 'अपने लक्षणों का वर्णन करें (जैसे, गंभीर छाती में दर्द, सांस की तकलीफ...)',
      describeSymptoms: 'अपने लक्षणों का वर्णन करें',
      analyze: 'लक्षणों का विश्लेषण करें',
      analyzing: 'विश्लेषण हो रहा है...',
      voiceInput: 'आवाज़ इनपुट',
      stopRecording: 'रिकॉर्डिंग बंद करें',
      startRecording: 'रिकॉर्डिंग शुरू करें',
      riskLevel: 'जोखिम स्तर',
      department: 'विभाग',
      riskSignals: 'जोखिम संकेत पाए गए',
      whatIfAnalysis: 'क्या-अगर विश्लेषण',
      enterSymptoms: 'लक्षण दर्ज करें',
      enterSymptomsDesc: 'कृपया पहले अपने लक्षणों का वर्णन करें।',
      analysisComplete: 'AI ट्राइएज पूर्ण',
      analysisCompleteDesc: 'AI द्वारा संचालित लक्षण विश्लेषण।',
      analysisFailed: 'विश्लेषण विफल',
      analysisFailedDesc: 'लक्षणों का विश्लेषण नहीं कर सका। कृपया पुनः प्रयास करें।',
      micPermission: 'माइक्रोफ़ोन एक्सेस आवश्यक',
      micPermissionDesc: 'आवाज़ इनपुट का उपयोग करने के लिए कृपया माइक्रोफ़ोन एक्सेस सक्षम करें।',
    },
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      submit: 'जमा करें',
      cancel: 'रद्द करें',
      close: 'बंद करें',
      next: 'अगला',
      previous: 'पिछला',
      skip: 'छोड़ें',
      finish: 'समाप्त करें',
      exportPdf: 'PDF निर्यात करें',
      characters: 'अक्षर',
    },
    risk: {
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'कम',
      emergency: 'आपातकालीन',
    },
    walkthrough: {
      welcome: 'MediQueue AI में आपका स्वागत है',
      welcomeDesc: 'आपका बुद्धिमान अस्पताल संचालन कमांड सेंटर। आइए हम आपको दिखाएं!',
      dashboard: 'लाइव अस्पताल डैशबोर्ड',
      dashboardDesc: 'सभी अस्पतालों में रीयल-टाइम बिस्तर उपलब्धता, डॉक्टर की स्थिति और कतार की लंबाई की निगरानी करें।',
      symptomChecker: 'AI लक्षण जांचकर्ता',
      symptomCheckerDesc: 'मरीज लक्षणों का वर्णन कर सकते हैं और AI-संचालित ट्राइएज सिफारिशें प्राप्त कर सकते हैं।',
      surgeOrch: 'सर्ज ऑर्केस्ट्रेशन',
      surgeOrchDesc: 'अस्पताल की भीड़भाड़ को रोकने के लिए भविष्यवाणी लोड संतुलन।',
      hospitalMap: 'भौगोलिक दृश्य',
      hospitalMapDesc: 'अस्पताल स्थानों, एम्बुलेंस स्थितियों और कवरेज क्षेत्रों की कल्पना करें।',
      analytics: 'ऐतिहासिक विश्लेषण',
      analyticsDesc: 'समय के साथ अधिभोग, प्रतीक्षा समय और महत्वपूर्ण घटनाओं में रुझानों को ट्रैक करें।',
      complete: 'टूर पूर्ण!',
      completeDesc: 'आप MediQueue AI का अन्वेषण करने के लिए तैयार हैं। अधिक सुविधाएँ खोजने के लिए क्लिक करें!',
    },
  },
  mr: {
    nav: {
      home: 'मुखपृष्ठ',
      dashboard: 'डॅशबोर्ड',
      symptomChecker: 'लक्षण तपासणी',
      nearbyHospitals: 'जवळची रुग्णालये',
      contact: 'संपर्क',
      analytics: 'विश्लेषण',
      patients: 'रुग्ण',
      commandCenter: 'कमांड सेंटर',
      dispatch: 'डिस्पॅच',
      transfers: 'हस्तांतरण',
      openDemo: 'डेमो पहा',
      backToHome: 'मुखपृष्ठावर परत',
    },
    hero: {
      badge: 'AI-सहाय्यित रुग्णालय संचालन',
      title: 'ऑपरेशनल कमांड',
      subtitle: 'एका सुलभ डॅशबोर्डमध्ये थेट रांगा, बेड स्थिती आणि जोखीम-आधारित ट्रायएज।',
      viewDashboard: 'लाइव्ह डॅशबोर्ड पहा',
      trySymptomChecker: 'लक्षण तपासणी वापरा',
      startTour: 'टूर सुरू करा',
      realTimeTriage: 'रिअल-टाइम ट्रायएज',
      secure: 'सुरक्षित आणि HIPAA तयार',
      aiPowered: 'AI-संचालित अंतर्दृष्टी',
    },
    symptomChecker: {
      title: 'रुग्ण लक्षण तपासणी',
      subtitle: 'AI-संचालित ट्रायएज डेमो। वैद्यकीय वापरासाठी नाही; पात्र डॉक्टरांचा सल्ला घ्या।',
      placeholder: 'तुमच्या लक्षणांचे वर्णन करा (उदा., तीव्र छातीत दुखणे, श्वास घेण्यास त्रास...)',
      describeSymptoms: 'तुमच्या लक्षणांचे वर्णन करा',
      analyze: 'लक्षणांचे विश्लेषण करा',
      analyzing: 'विश्लेषण करत आहे...',
      voiceInput: 'आवाज इनपुट',
      stopRecording: 'रेकॉर्डिंग थांबवा',
      startRecording: 'रेकॉर्डिंग सुरू करा',
      riskLevel: 'जोखीम पातळी',
      department: 'विभाग',
      riskSignals: 'जोखीम संकेत आढळले',
      whatIfAnalysis: 'काय-जर विश्लेषण',
      enterSymptoms: 'लक्षणे प्रविष्ट करा',
      enterSymptomsDesc: 'कृपया प्रथम तुमच्या लक्षणांचे वर्णन करा।',
      analysisComplete: 'AI ट्रायएज पूर्ण',
      analysisCompleteDesc: 'AI द्वारे संचालित लक्षण विश्लेषण.',
      analysisFailed: 'विश्लेषण अयशस्वी',
      analysisFailedDesc: 'लक्षणांचे विश्लेषण करता आले नाही. कृपया पुन्हा प्रयत्न करा.',
      micPermission: 'मायक्रोफोन प्रवेश आवश्यक',
      micPermissionDesc: 'आवाज इनपुट वापरण्यासाठी कृपया मायक्रोफोन प्रवेश सक्षम करा.',
    },
    common: {
      loading: 'लोड होत आहे...',
      error: 'त्रुटी',
      submit: 'सबमिट करा',
      cancel: 'रद्द करा',
      close: 'बंद करा',
      next: 'पुढे',
      previous: 'मागे',
      skip: 'वगळा',
      finish: 'समाप्त करा',
      exportPdf: 'PDF निर्यात करा',
      characters: 'अक्षरे',
    },
    risk: {
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'कमी',
      emergency: 'आपत्कालीन',
    },
    walkthrough: {
      welcome: 'MediQueue AI मध्ये आपले स्वागत आहे',
      welcomeDesc: 'तुमचे बुद्धिमान रुग्णालय संचालन कमांड सेंटर. आम्ही तुम्हाला दाखवू!',
      dashboard: 'लाइव्ह रुग्णालय डॅशबोर्ड',
      dashboardDesc: 'सर्व रुग्णालयांमध्ये रिअल-टाइम बेड उपलब्धता, डॉक्टर स्थिती आणि रांग लांबी निरीक्षण करा.',
      symptomChecker: 'AI लक्षण तपासणी',
      symptomCheckerDesc: 'रुग्ण लक्षणांचे वर्णन करू शकतात आणि AI-संचालित ट्रायएज शिफारसी प्राप्त करू शकतात.',
      surgeOrch: 'सर्ज ऑर्केस्ट्रेशन',
      surgeOrchDesc: 'रुग्णालयाची गर्दी टाळण्यासाठी भविष्यवाणी लोड संतुलन.',
      hospitalMap: 'भौगोलिक दृश्य',
      hospitalMapDesc: 'रुग्णालय स्थाने, रुग्णवाहिका स्थाने आणि कव्हरेज क्षेत्रे दृश्यमान करा.',
      analytics: 'ऐतिहासिक विश्लेषण',
      analyticsDesc: 'कालांतराने व्याप्ती, प्रतीक्षा वेळ आणि गंभीर घटनांमधील ट्रेंड ट्रॅक करा.',
      complete: 'टूर पूर्ण!',
      completeDesc: 'तुम्ही MediQueue AI एक्सप्लोर करण्यास तयार आहात. अधिक वैशिष्ट्ये शोधण्यासाठी क्लिक करा!',
    },
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('mediqueue-language') as Language;
    if (saved && ['en', 'hi', 'mr'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mediqueue-language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: Translations | string = translations[language];
    
    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        value = translations.en;
        for (const fallbackKey of keys) {
          if (typeof value === 'object' && value !== null && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return the key if translation not found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
