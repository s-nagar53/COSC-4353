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
      availability: ["2025-09-01"]
    },
    {
      uid: '4axjSd7bv9OASxjREr7uVRr2HvJ3',
      role: 'volunteer',
      name: 'John Smith',
      address: '399 Hamilton Street',
      city: 'Houston',
      state: 'TX',
      zip: '77002',
      skills: ["Teaching / Tutoring", "Food Preparation / Serving", "Event Setup / Cleanup"],
      availability: ["2025-10-01"]
    },
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
      availability: ["2025-08-15"]
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
      availability: ["2025-10-01"]
    },
    {
      uid: 'BiDMZnGixqQ8Cao6DuG8l59v90T2',
      role: 'volunteer',
      name: 'Sarah Johnson',
      address: '101 Cougar Place',
      city: 'Houston',
      state: 'TX',
      zip: '77066',
      skills: ["Event Setup / Cleanup", "First Aid / CPR"],
      preferences: 'Flexible schedule',
      availability: ["2025-12-01"]
    },
    {
      uid: 'CLQvkdh3vhbjASRJ5jfj7Iluzsh2',
      role: 'volunteer',
      name: 'Robert Chen',
      address: '457 Hollywood Street',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90026',
      skills: ["Driving / Transportation", "Technical Support / IT Help"],
      availability: ["2025-07-20"]
    }
  ],
};

module.exports = { profiles };
