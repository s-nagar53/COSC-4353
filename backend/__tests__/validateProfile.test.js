const { validateProfile } = require('../utils/validateProfile');

describe('validateProfile', () => {
  const baseData = {
    uid: '123',
    name: 'John Doe',
    address: '123 Main St',
    address2: 'Apt 4B',
    city: 'Houston',
    state: 'TX',
    zip: '77001',
    skills: ['Cooking'],
    availability: ['2024-10-01']
  };

  it('should return no errors for a valid volunteer', () => {
    const errors = validateProfile(baseData, 'volunteer');
    expect(errors).toEqual([]);
  });

  it('should return no errors for a valid admin (no skills/availability)', () => {
    const { skills, availability, ...adminData } = baseData;
    const errors = validateProfile(adminData, 'admin');
    expect(errors).toEqual([]);
  });

  it('should catch missing required fields', () => {
    const data = {};
    const errors = validateProfile(data, 'volunteer');
    expect(errors).toContain('Missing uid');
    expect(errors).toContain('Full Name is required');
    expect(errors).toContain('Address 1 is required');
    expect(errors).toContain('City is required');
    expect(errors).toContain('State must be a 2-character code');
    expect(errors).toContain('Zip code must be 5 to 9 characters');
    expect(errors).toContain('At least one skill required');
    expect(errors).toContain('At least one availability date required');
  });

  it('should catch field length issues', () => {
    const data = {
      ...baseData,
      name: 'A'.repeat(51),
      address: 'B'.repeat(101),
      address2: 'C'.repeat(101),
      city: 'D'.repeat(101),
      state: 'TEX', // too long
      zip: '123' // too short
    };
    const errors = validateProfile(data, 'volunteer');
    expect(errors).toContain('Full Name must be at most 50 characters');
    expect(errors).toContain('Address 1 must be at most 100 characters');
    expect(errors).toContain('Address 2 must be at most 100 characters');
    expect(errors).toContain('City must be at most 100 characters');
    expect(errors).toContain('State must be a 2-character code');
    expect(errors).toContain('Zip code must be 5 to 9 characters');
  });
});
