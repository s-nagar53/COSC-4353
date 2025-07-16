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
            availability: [new Date(Date.UTC(2025, 8, 1)).toISOString()] // September 1, 2025
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
            availability: [new Date(Date.UTC(2025, 11, 1)).toISOString()] // December 1, 2025
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
            skills: ["Food Preparation / Serving", "Fundraising / Donation Drives"],
            urgency: '2',
            availability: [new Date(Date.UTC(2025, 7, 15)).toISOString()] // August 15, 2025
        },
        {
            eid: 'event_004',
            uid: 'q7r1T6ypVAgvadpinvHSGkMexc12',
            eventname: 'After-School Tutoring',
            address: '456 Education Blvd',
            city: 'Houston',
            state: 'TX',
            zip: '77002',
            skills: ["Teaching / Tutoring", "Childcare / Youth Engagement"],
            urgency: '1',
            availability: [new Date(Date.UTC(2025, 9, 1)).toISOString()] // October 1, 2025
        },
        {
            eid: 'event_005',
            uid: 'kndfj1pba1QC8gIrraJ7hpbokJK1',
            eventname: 'Park Cleanup Day',
            address: '789 Greenway Park',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90026',
            skills: ["Event Setup / Cleanup", "Driving / Transportation"],
            urgency: '2',
            availability: [new Date(Date.UTC(2025, 6, 20)).toISOString()] // July 20, 2025
        }
    ]
};

module.exports = { events };