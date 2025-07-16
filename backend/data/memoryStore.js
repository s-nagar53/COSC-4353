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
            city: 'Los Angeles',
            state: 'CA',
            zip: '90001',
            skills: ["Event Setup / Cleanup"],
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
            skills: ["Teaching / Tutoring", "Food Preparation / Serving", "Event Setup / Cleanup"],
            availability: [new Date(2025, 9, 1).toISOString()]
          },
          // New volunteers
          {
            uid: 'vol_003',
            role: 'volunteer',
            name: 'Maria Garcia',
            address: '456 Oak Street',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90005',
            skills: ["Food Preparation / Serving", "Spanish Translation"],
            preferences: 'Weekday mornings',
            availability: [new Date(2025, 8, 15).toISOString()]
        },
        {
            uid: 'vol_004',
            role: 'volunteer',
            name: 'David Kim',
            address: '789 Pine Road',
            city: 'Houston',
            state: 'TX',
            zip: '77002',
            skills: ["Teaching / Tutoring", "Computer Skills"],
            availability: [new Date(2025, 10, 1).toISOString()]
        },
        {
            uid: 'vol_005',
            role: 'volunteer',
            name: 'Sarah Johnson',
            address: '321 Maple Drive',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90026',
            skills: ["Event Setup / Cleanup", "First Aid Certified"],
            preferences: 'Flexible schedule',
            availability: [new Date(2025, 7, 20).toISOString()]
        },
        {
            uid: 'vol_006',
            role: 'volunteer',
            name: 'Robert Chen',
            address: '654 Elm Street',
            city: 'Houston',
            state: 'TX',
            zip: '77008',
            skills: ["Physical Labor", "Construction Skills"],
            availability: [new Date(2025, 11, 1).toISOString()]
        }
    ],
  };

  module.exports = { profiles };
  