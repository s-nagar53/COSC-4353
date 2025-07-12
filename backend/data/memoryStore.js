const profiles = {
    admins: [
        {
            uid: 'q7r1T6ypVAgvadpinvHSGkMexc12',
            role: 'admin',
            name: 'Admin 1',
            address: '123 Admin St',
            city: 'Houston',
            state: 'TX',
            zip: '77777',
          },
        {
            uid: 'kndfj1pba1QC8gIrraJ7hpbGsOf1',
            role: 'admin',
            name: 'Admin 2',
            address: '678 Admin Ave',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90001',
          }
    ],
    volunteers: [
        {
            uid: 'OdSSlyuAQaQI7LuicDeJhmrUqfQ2',
            role: 'volunteer',
            name: 'Jane Doe',
            address: '123 Winter Ave',
            city: 'Miami',
            state: 'FL',
            zip: '90210',
            skills: ['Event Setup / Cleanup'],
            preferences: 'Weekends only',
            availability: [new Date(2025, 9, 1).toISOString()]
          },

          {
            uid: '4axjSd7bv9OASxjREr7uVRr2HvJ3',
            role: 'volunteer',
            name: 'John Smith',
            address: '123 Main st',
            city: 'Houston',
            state: 'TX',
            zip: '72001',
            skills: ['Teaching / Tutoring', 'Food Preparation / Serving'],
            availability: [new Date(2025, 9, 1).toISOString()]
          }
    ],
  };
  
  module.exports = { profiles };
  