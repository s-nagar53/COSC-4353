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
            availability: [new Date(Date.UTC(2025, 8, 1)).toISOString()] // September 1, 2025
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
            availability: [new Date(Date.UTC(2025, 8, 1)).toISOString()] // September 1, 2025
          },
          // New volunteers
          {
            uid: 'cp12tNImj0f2YsgdKQ6JmgeXdbJ2',
            role: 'volunteer',
            name: 'Maria Garcia',
            address: '456 Oak Street',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90005',
            skills: ["Food Preparation / Serving", "Translation / Interpretation"],
            preferences: 'Weekday mornings',
            availability: [new Date(Date.UTC(2025, 7, 15)).toISOString()] // August 15, 2025
        },
        {
            uid: 'IRNL3zMDkNSkEMN9lKmVvaiLHfE2',
            role: 'volunteer',
            name: 'David Kim',
            address: '789 Pine Road',
            city: 'Houston',
            state: 'TX',
            zip: '77002',
            skills: ["Teaching / Tutoring", "Childcare / Youth Engagement"],
            availability: [new Date(Date.UTC(2025, 9, 1)).toISOString()] // October 1, 2025
        },
        {
            uid: 'BiDMZnGixqQ8Cao6DuG8l59v90T2',
            role: 'volunteer',
            name: 'Sarah Johnson',
            address: '321 Maple Drive',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90026',
            skills: ["Event Setup / Cleanup", "First Aid / CPR"],
            preferences: 'Flexible schedule',
            availability: [new Date(Date.UTC(2025, 11, 1)).toISOString()] // December 1, 2025
        },
        {
            uid: 'CLQvkdh3vhbjASRJ5jfj7Iluzsh2',
            role: 'volunteer',
            name: 'Robert Chen',
            address: '654 Elm Street',
            city: 'Houston',
            state: 'TX',
            zip: '77008',
            skills: ["Driving / Transportation", "Technical Support / IT Help"],
            availability: [new Date(Date.UTC(2025, 6, 20)).toISOString()] // July 20, 2025
        }
    ],
  };

  module.exports = { profiles };
  