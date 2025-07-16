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
            eventname: 'Cleaning Pool',
            address: '678 Gavin Ave',
            city: 'Houston',
            state: 'TX',
            zip: '77066',
            skills: ["Event Setup / Cleanup"],
            urgency: '3',
            availability: [new Date(2025, 12, 1).toISOString()]
        },
        // New events
        {
            eid: 'event_003',
            uid: 'kndfj1pba1QC8gIrraJ7hpbGsOf1',
            eventname: 'Food Bank Assistance',
            address: '123 Charity Lane',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90005',
            skills: ["Food Preparation / Serving", "Inventory Management"],
            urgency: '2',
            availability: [new Date(2025, 8, 15).toISOString()]
        },
        {
            eid: 'event_004',
            uid: 'q7r1T6ypVAgvadpinvHSGkMexc12',
            eventname: 'After-School Tutoring',
            address: '456 Education Blvd',
            city: 'Houston',
            state: 'TX',
            zip: '77002',
            skills: ["Teaching / Tutoring", "Childcare"],
            urgency: '1',
            availability: [new Date(2025, 10, 1).toISOString()]
        },
        {
            eid: 'event_005',
            uid: 'kndfj1pba1QC8gIrraJ7hpbokJK1',
            eventname: 'Park Cleanup Day',
            address: '789 Greenway Park',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90026',
            skills: ["Event Setup / Cleanup", "Physical Labor"],
            urgency: '2',
            availability: [new Date(2025, 7, 20).toISOString()]
        }
    ]
};
  
  module.exports = { events };
  