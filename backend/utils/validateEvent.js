function validateEvent(data) {
    const errors = [];
  
    if (!data.eid) errors.push('Missing event ID (eid)');
    if (!data.uid) errors.push('Missing user ID (uid)'); // Keep uid for the creator
    if (!data.eventname || !data.eventname.trim()) errors.push('Missing event name');
    if (!data.address || !data.address.trim()) errors.push('Missing address');
    if (!data.city || !data.city.trim()) errors.push('Missing city');
    if (!data.state || !data.state.trim()) errors.push('Missing state');
    if (!data.zip || data.zip.length < 5) errors.push('Invalid zip code');
    if (!data.urgency) errors.push('Missing urgency level');
  
    if (!Array.isArray(data.skills) || data.skills.length === 0) {
      errors.push('At least one skill required');
    }
  
    return errors;
}
  
module.exports = { validateEvent };
  