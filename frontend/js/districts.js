/**
 * Rwandan Districts List
 * All districts organized by province
 * For Kigali province, we use "Kigali" instead of individual districts
 */

const RWANDAN_DISTRICTS = [
  // Kigali Province (use "Kigali" instead of individual districts)
  'Kigali',
  
  // Eastern Province
  'Bugesera',
  'Gatsibo',
  'Kayonza',
  'Kirehe',
  'Ngoma',
  'Nyagatare',
  'Rwamagana',
  
  // Northern Province
  'Burera',
  'Gakenke',
  'Gicumbi',
  'Musanze',
  'Rulindo',
  
  // Western Province
  'Karongi',
  'Ngororero',
  'Nyabihu',
  'Nyamasheke',
  'Rubavu',
  'Rusizi',
  'Rutsiro',
  
  // Southern Province
  'Gisagara',
  'Huye',
  'Kamonyi',
  'Muhanga',
  'Nyamagabe',
  'Nyanza',
  'Nyaruguru',
  'Ruhango',
];

// Sort alphabetically for better UX
RWANDAN_DISTRICTS.sort();

// Export for use in other files
if (typeof window !== 'undefined') {
  window.RWANDAN_DISTRICTS = RWANDAN_DISTRICTS;
}

// For Node.js environments (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RWANDAN_DISTRICTS;
}

