import { TriageResult } from '@/types/hospital';

export function analyzeSymptoms(symptoms: string): TriageResult {
  const s = symptoms.toLowerCase().trim();
  
  if (!s) {
    return {
      risk: 'Low',
      department: 'General Medicine',
      message: 'Please enter symptoms to analyze.',
      keywords: [],
    };
  }

  const keywords: string[] = [];
  
  if (s.includes('chest pain')) keywords.push('chest pain');
  if (s.includes('shortness of breath') || s.includes('breath')) keywords.push('shortness of breath');
  if (s.includes('stroke')) keywords.push('stroke');
  if (s.includes('face droop')) keywords.push('face droop');
  if (s.includes('slurred speech')) keywords.push('slurred speech');
  if (s.includes('half body') || s.includes('one side')) keywords.push('weakness on one side');
  if (s.includes('high fever') || s.includes('104')) keywords.push('high fever');
  if (s.includes('vomit')) keywords.push('vomiting');
  if (s.includes('infection')) keywords.push('suspected infection');

  let risk: TriageResult['risk'] = 'Low';
  let department = 'General Medicine';
  let message = '';

  if (s.includes('chest pain') || s.includes('shortness of breath') || s.includes('breath')) {
    risk = 'High';
    department = 'Cardiology / Emergency';
    message = 'Possible cardiac emergency. Route to Emergency and Cardiology immediately.';
  } else if (s.includes('stroke') || s.includes('face droop') || s.includes('slurred speech') || s.includes('half body')) {
    risk = 'High';
    department = 'Neurology / Emergency';
    message = 'Suspected stroke. Treat as time-critical.';
  } else if (s.includes('high fever') || s.includes('104') || s.includes('vomit') || s.includes('infection')) {
    risk = 'Medium';
    department = 'General Medicine';
    message = 'Suggest consultation within a few hours.';
  } else {
    message = 'Likely non-emergency, but medical opinion is still recommended.';
  }

  return { risk, department, message, keywords };
}

export function getWhatIfAnalysis(risk: TriageResult['risk']): string {
  if (risk === 'High') {
    return 'If chest pain and breath issues were absent, risk would likely downgrade to Medium with OPD triage instead of Emergency.';
  } else if (risk === 'Medium') {
    return 'If fever resolved and no infection signs remained for 24 hours, risk would move towards Low with home care + follow-up.';
  }
  return '';
}
