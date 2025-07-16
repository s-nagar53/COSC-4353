function validateProfile(data, role) {
    const errors = [];
  
    // Shared fields
    if (!data.uid) errors.push('Missing uid');
  
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Full Name is required');
    } else if (data.name.length > 50) {
      errors.push('Full Name must be at most 50 characters');
    }
  
    if (!data.address || data.address.trim().length === 0) {
      errors.push('Address 1 is required');
    } else if (data.address.length > 100) {
      errors.push('Address 1 must be at most 100 characters');
    }
  
    if (data.address2 && data.address2.length > 100) {
      errors.push('Address 2 must be at most 100 characters');
    }
  
    if (!data.city || data.city.trim().length === 0) {
      errors.push('City is required');
    } else if (data.city.length > 100) {
      errors.push('City must be at most 100 characters');
    }
  
    if (!data.state || data.state.length !== 2) {
      errors.push('State must be a 2-character code');
    }
  
    if (!data.zip || data.zip.length < 5 || data.zip.length > 9) {
      errors.push('Zip code must be 5 to 9 characters');
    }
  
    // Volunteer-specific
    if (role === 'volunteer') {
      if (!Array.isArray(data.skills) || data.skills.length === 0) {
        errors.push('At least one skill required');
      }
  
      if (!Array.isArray(data.availability) || data.availability.length === 0) {
        errors.push('At least one availability date required');
      }
  
      // Preferences is optional — no check needed
    }
  
  
    return errors;
  }
  
  module.exports = { validateProfile };
  