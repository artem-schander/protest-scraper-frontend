const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/lib/i18n/locales/en.json', 'utf8'));
const keys = [
  'title', 'stepOf', 'step1Title', 'step3Title', 'step4Title', 'eventTitle',
  'description', 'charactersCount', 'detailsUrl', 'detailsUrlPlaceholder',
  'detailsUrlHelper', 'tags', 'tagsPlaceholder', 'tagsHelper',
  'expectedAttendees', 'attendeesPlaceholder', 'attendeesHelper',
  'back', 'next', 'submitting', 'submit'
];
const missing = keys.filter(k => !en.createEvent || !en.createEvent[k]);
if (missing.length > 0) {
  console.log('❌ Missing keys in createEvent:', missing.join(', '));
  process.exit(1);
} else {
  console.log('✅ All translation keys found');
  console.log('\nKeys in en.json:', Object.keys(en.createEvent || {}).join(', '));
}
