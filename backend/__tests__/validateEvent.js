const { validateEvent } = require('./validateEvent'); // Adjust path as needed

describe('validateEvent', () => {
  // Valid data for testing
  const validData = {
    eid: 'event123',
    uid: 'user456',
    eventname: 'Community Cleanup',
    address: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zip: '12345',
    urgency: 'medium',
    skills: ['cleaning', 'organizing']
  };

  describe('Valid input', () => {
    test('should return empty array for valid event data', () => {
      const result = validateEvent(validData);
      expect(result).toEqual([]);
    });
  });

  describe('Missing required fields', () => {
    test('should return error for missing eid', () => {
      const data = { ...validData };
      delete data.eid;
      const result = validateEvent(data);
      expect(result).toContain('Missing event ID (eid)');
    });

    test('should return error for missing uid', () => {
      const data = { ...validData };
      delete data.uid;
      const result = validateEvent(data);
      expect(result).toContain('Missing user ID (uid)');
    });

    test('should return error for missing eventname', () => {
      const data = { ...validData };
      delete data.eventname;
      const result = validateEvent(data);
      expect(result).toContain('Missing event name');
    });

    test('should return error for missing address', () => {
      const data = { ...validData };
      delete data.address;
      const result = validateEvent(data);
      expect(result).toContain('Missing address');
    });

    test('should return error for missing city', () => {
      const data = { ...validData };
      delete data.city;
      const result = validateEvent(data);
      expect(result).toContain('Missing city');
    });

    test('should return error for missing state', () => {
      const data = { ...validData };
      delete data.state;
      const result = validateEvent(data);
      expect(result).toContain('Missing state');
    });

    test('should return error for missing urgency', () => {
      const data = { ...validData };
      delete data.urgency;
      const result = validateEvent(data);
      expect(result).toContain('At least one skill required');
    });
  });

  describe('Empty/whitespace string validation', () => {
    test('should return error for empty eventname', () => {
      const data = { ...validData, eventname: '' };
      const result = validateEvent(data);
      expect(result).toContain('Missing event name');
    });

    test('should return error for whitespace-only eventname', () => {
      const data = { ...validData, eventname: '   ' };
      const result = validateEvent(data);
      expect(result).toContain('Missing event name');
    });

    test('should return error for empty address', () => {
      const data = { ...validData, address: '' };
      const result = validateEvent(data);
      expect(result).toContain('Missing address');
    });

    test('should return error for whitespace-only city', () => {
      const data = { ...validData, city: '  ' };
      const result = validateEvent(data);
      expect(result).toContain('Missing city');
    });

    test('should return error for whitespace-only state', () => {
      const data = { ...validData, state: '\t' };
      const result = validateEvent(data);
      expect(result).toContain('Missing state');
    });
  });

  describe('Zip code validation', () => {
    test('should return error for missing zip', () => {
      const data = { ...validData };
      delete data.zip;
      const result = validateEvent(data);
      expect(result).toContain('Invalid zip code');
    });

    test('should return error for zip code less than 5 characters', () => {
      const data = { ...validData, zip: '1234' };
      const result = validateEvent(data);
      expect(result).toContain('Invalid zip code');
    });

    test('should accept zip code with exactly 5 characters', () => {
      const data = { ...validData, zip: '12345' };
      const result = validateEvent(data);
      expect(result).not.toContain('Invalid zip code');
    });
  });

  describe('Skills validation', () => {
    test('should return error for missing skills array', () => {
      const data = { ...validData };
      delete data.skills;
      
      const result = validateEvent(data);
      expect(result).toContain('At least one skill required');
    });

    test('should return error for empty skills array', () => {
      const data = { ...validData, skills: [] };
      
      const result = validateEvent(data);
      expect(result).toContain('At least one skill required');
    });

    test('should return error for non-array skills', () => {
      const data = { ...validData, skills: 'not-an-array' };
      
      const result = validateEvent(data);
      expect(result).toContain('At least one skill required');
    });

    test('should accept valid skills array', () => {
      const data = { ...validData, skills: ['skill1', 'skill2'] };
      
      const result = validateEvent(data);
      expect(result).not.toContain('At least one skill required');
    });
  });

  describe('Multiple validation errors', () => {
    test('should return multiple errors for multiple missing fields', () => {
      const data = {
        eventname: '',
        address: '   ',
        zip: '123'
      };
      
      const result = validateEvent(data);
      expect(result.length).toBeGreaterThan(1);
      expect(result).toContain('Missing event ID (eid)');
      expect(result).toContain('Missing user ID (uid)');
      expect(result).toContain('Missing event name');
      expect(result).toContain('Missing address');
      expect(result).toContain('Missing city');
      expect(result).toContain('Missing state');
      expect(result).toContain('Invalid zip code');
      expect(result).toContain('Missing urgency level');
    });
  });
});