const { validateEvent } = require('../utils/validateEvent');

describe('validateEvent', () => {
  const baseEvent = {
    eid: 'ev123',
    uid: 'user1',
    eventname: 'Community Event',
    address: '123 Main St',
    city: 'Houston',
    state: 'TX',
    zip: '77001',
    urgency: 'High',
    skills: ['Setup']
  };

  it('should return no errors for a valid event', () => {
    const errors = validateEvent(baseEvent);
    expect(errors).toEqual([]);
  });

  it('should catch all missing required fields', () => {
    const errors = validateEvent({});
    expect(errors).toContain('Missing event ID (eid)');
    expect(errors).toContain('Missing user ID (uid)');
    expect(errors).toContain('Missing event name');
    expect(errors).toContain('Missing address');
    expect(errors).toContain('Missing city');
    expect(errors).toContain('Missing state');
    expect(errors).toContain('Invalid zip code');
    expect(errors).toContain('Missing urgency level');
    expect(errors).toContain('At least one skill required');
  });

  it('should catch empty strings and short zip', () => {
    const invalid = {
      eid: '',
      uid: '',
      eventname: ' ',
      address: '',
      city: '',
      state: '',
      zip: '123',
      urgency: '',
      skills: []
    };
    const errors = validateEvent(invalid);
    expect(errors).toContain('Missing event ID (eid)');
    expect(errors).toContain('Missing user ID (uid)');
    expect(errors).toContain('Missing event name');
    expect(errors).toContain('Missing address');
    expect(errors).toContain('Missing city');
    expect(errors).toContain('Missing state');
    expect(errors).toContain('Invalid zip code');
    expect(errors).toContain('Missing urgency level');
    expect(errors).toContain('At least one skill required');
  });

  it('should not fail if extra fields are present', () => {
    const eventWithExtras = {
      ...baseEvent,
      description: 'Optional description',
      availability: ['2025-10-01'],
    };
    const errors = validateEvent(eventWithExtras);
    expect(errors).toEqual([]);
  });
});
