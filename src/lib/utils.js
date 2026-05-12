export function getLanguageName(code) {
  const languages = {
    en: 'English',
    es: 'Español',
    pt: 'Português'
  }
  return languages[code] || code
}

export function getLanguageFlag(code) {
  const flags = {
    en: '🇨🇦',
    es: '🇸🇻',
    pt: '🇧🇷'
  }
  return flags[code] || '🌐'
}
