// data/statesData.js - US States with codes and names
const states = [
  { code: 'AL', name: 'Alabama', region: 'South' },
  { code: 'AK', name: 'Alaska', region: 'West' },
  { code: 'AZ', name: 'Arizona', region: 'West' },
  { code: 'AR', name: 'Arkansas', region: 'South' },
  { code: 'CA', name: 'California', region: 'West' },
  { code: 'CO', name: 'Colorado', region: 'West' },
  { code: 'CT', name: 'Connecticut', region: 'Northeast' },
  { code: 'DE', name: 'Delaware', region: 'South' },
  { code: 'FL', name: 'Florida', region: 'South' },
  { code: 'GA', name: 'Georgia', region: 'South' },
  { code: 'HI', name: 'Hawaii', region: 'West' },
  { code: 'ID', name: 'Idaho', region: 'West' },
  { code: 'IL', name: 'Illinois', region: 'Midwest' },
  { code: 'IN', name: 'Indiana', region: 'Midwest' },
  { code: 'IA', name: 'Iowa', region: 'Midwest' },
  { code: 'KS', name: 'Kansas', region: 'Midwest' },
  { code: 'KY', name: 'Kentucky', region: 'South' },
  { code: 'LA', name: 'Louisiana', region: 'South' },
  { code: 'ME', name: 'Maine', region: 'Northeast' },
  { code: 'MD', name: 'Maryland', region: 'South' },
  { code: 'MA', name: 'Massachusetts', region: 'Northeast' },
  { code: 'MI', name: 'Michigan', region: 'Midwest' },
  { code: 'MN', name: 'Minnesota', region: 'Midwest' },
  { code: 'MS', name: 'Mississippi', region: 'South' },
  { code: 'MO', name: 'Missouri', region: 'Midwest' },
  { code: 'MT', name: 'Montana', region: 'West' },
  { code: 'NE', name: 'Nebraska', region: 'Midwest' },
  { code: 'NV', name: 'Nevada', region: 'West' },
  { code: 'NH', name: 'New Hampshire', region: 'Northeast' },
  { code: 'NJ', name: 'New Jersey', region: 'Northeast' },
  { code: 'NM', name: 'New Mexico', region: 'West' },
  { code: 'NY', name: 'New York', region: 'Northeast' },
  { code: 'NC', name: 'North Carolina', region: 'South' },
  { code: 'ND', name: 'North Dakota', region: 'Midwest' },
  { code: 'OH', name: 'Ohio', region: 'Midwest' },
  { code: 'OK', name: 'Oklahoma', region: 'South' },
  { code: 'OR', name: 'Oregon', region: 'West' },
  { code: 'PA', name: 'Pennsylvania', region: 'Northeast' },
  { code: 'RI', name: 'Rhode Island', region: 'Northeast' },
  { code: 'SC', name: 'South Carolina', region: 'South' },
  { code: 'SD', name: 'South Dakota', region: 'Midwest' },
  { code: 'TN', name: 'Tennessee', region: 'South' },
  { code: 'TX', name: 'Texas', region: 'South' },
  { code: 'UT', name: 'Utah', region: 'West' },
  { code: 'VT', name: 'Vermont', region: 'Northeast' },
  { code: 'VA', name: 'Virginia', region: 'South' },
  { code: 'WA', name: 'Washington', region: 'West' },
  { code: 'WV', name: 'West Virginia', region: 'South' },
  { code: 'WI', name: 'Wisconsin', region: 'Midwest' },
  { code: 'WY', name: 'Wyoming', region: 'West' },
  // US Territories (optional)
  { code: 'DC', name: 'District of Columbia', region: 'South' },
  { code: 'PR', name: 'Puerto Rico', region: 'Territory' },
  { code: 'VI', name: 'US Virgin Islands', region: 'Territory' },
  { code: 'AS', name: 'American Samoa', region: 'Territory' },
  { code: 'GU', name: 'Guam', region: 'Territory' },
  { code: 'MP', name: 'Northern Mariana Islands', region: 'Territory' }
];

// Helper functions for easy access
const statesHelper = {
  // Get all states as array
  getAll: () => states,
  
  // Get state by code
  getByCode: (code) => states.find(state => state.code === code.toUpperCase()),
  
  // Get state by name
  getByName: (name) => states.find(state => 
    state.name.toLowerCase() === name.toLowerCase()
  ),
  
  // Get states by region
  getByRegion: (region) => states.filter(state => state.region === region),
  
  // Get just codes
  getCodes: () => states.map(state => state.code),
  
  // Get just names
  getNames: () => states.map(state => state.name),
  
  // Convert code to name
  codeToName: (code) => {
    const state = states.find(s => s.code === code.toUpperCase());
    return state ? state.name : null;
  },
  
  // Convert name to code
  nameToCode: (name) => {
    const state = states.find(s => s.name.toLowerCase() === name.toLowerCase());
    return state ? state.code : null;
  },
  
  // Validate state code
  isValidCode: (code) => states.some(state => state.code === code.toUpperCase()),
  
  // Validate state name
  isValidName: (name) => states.some(state => 
    state.name.toLowerCase() === name.toLowerCase()
  ),
  
  // Get states formatted for dropdown/select
  getForDropdown: () => states.map(state => ({
    value: state.code,
    label: `${state.name} (${state.code})`
  })),
  
  // Get regions
  getRegions: () => [...new Set(states.map(state => state.region))]
};

module.exports = { states, statesHelper };