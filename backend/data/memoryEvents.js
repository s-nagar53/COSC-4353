  const events = {
    event: 
    [
        {
            eid: 'event_001', // Event ID
            uid: 'kndfj1pba1QC8gIrraJ7hpbokJK1', // Creator's user ID
            eventname: 'Building Homes for the Homeless',
            address: '678 Admin Ave',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90001',
            skills: ["Event Setup / Cleanup", "Elderly Care / Companionship"],
            urgency: '1',
            availability: [new Date(2025, 9, 1).toISOString()]
        },

        {
            eid: 'event_002', // Event ID
            uid: 'q7r1T6ypVAgvadpinvHSGkMexc12', // Creator's user ID
            eventname: 'Clearning Pool',
            address: '678 Gavin Ave',
            city: 'Houston',
            state: 'TX',
            zip: '77066',
            skills: ["Event Setup / Cleanup"],
            urgency: '3',
            availability: [new Date(2025, 12, 1).toISOString()]
        }
    ]
};
  
  module.exports = { events };
  