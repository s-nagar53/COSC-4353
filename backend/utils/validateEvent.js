function validateEvent(data) {
    const errors = [];
  
    if (!data.uid) errors.push('Missing uid');
    if (!data.eventname) errors.push('Missing full name');
    if (!data.address) errors.push('Missing address');
    if (!data.city) errors.push('Missing city');
    if (!data.state) errors.push('Missing state');
    if (!data.zip || data.zip.length < 5) errors.push('Invalid zip code');
    if (!data.urgency) errors.push('Missing Urgency Level');
  
    if (!Array.isArray(data.skills) || data.skills.length === 0) {
      errors.push('At least one skill required');
    }
    if (!Array.isArray(data.availability) || data.availability.length === 0) {
      errors.push('At least one availability date required');
    }
  
    return errors;
  }
  
  module.exports = { validateEvent };
  