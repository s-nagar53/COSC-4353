const request = require('supertest');
const express = require('express');

// Mock the dependencies
jest.mock('../utils/reportService');
jest.mock('pdfkit');
jest.mock('csv-stringify', () => ({
  stringify: jest.fn()
}));
jest.setTimeout(10000);

const { getVolunteerData, getEventData } = require('../utils/reportService');
const pdfkit = require('pdfkit');
const { stringify } = require('csv-stringify');

describe('🔍 ReportRoutes', () => {
  let app;
  let mockPdf;
  let mockCsvStringify;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock PDFKit
    mockPdf = {
      pipe: jest.fn().mockImplementation((res) => {
      // ✅ Simulate the PDF stream writing and ending the response
      if (typeof res.write === 'function') {
        res.write('mock PDF content');
      }
      if (typeof res.end === 'function') {
        res.end(); // ✅ Important so Supertest completes
      }
      return mockPdf;
    }),
      text: jest.fn().mockReturnThis(),
      addPage: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      fontSize: jest.fn().mockReturnThis(),
      font: jest.fn().mockReturnThis(),
      moveDown: jest.fn().mockReturnThis(),
      fillColor: jest.fn().mockReturnThis(),
      rect: jest.fn().mockReturnThis(),
      fill: jest.fn().mockReturnThis(),
      fillAndStroke: jest.fn().mockReturnThis(),
      stroke: jest.fn().mockReturnThis(),
      lineTo: jest.fn().mockReturnThis(),
      moveTo: jest.fn().mockReturnThis(),
      strokeColor: jest.fn().mockReturnThis(),
      lineWidth: jest.fn().mockReturnThis(),
      page: {
        width: 612,
        margins: { right: 50 }
      },
      x: 0,
      y: 0
    };
    pdfkit.mockImplementation(() => mockPdf);

    // Mock csv-stringify
    mockCsvStringify = jest.fn();
    stringify.mockImplementation(mockCsvStringify);

    // Create Express app and mount routes
    app = express();
    app.use(express.json());
    
    // Import and mount the routes
    const reportRoutes = require('../routes/reportRoutes');
    app.use('/', reportRoutes);
  });

  describe('GET /download/volunteers/pdf', () => {
    it('should generate volunteer PDF report successfully', async () => {
      // Arrange
      const mockVolunteerData = [
        {
          name: 'John Doe',
          phone: '123-456-7890',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          skills: ['skill1', 'skill2'],
          totalEvents: 2,
          history: [
            {
              eventName: 'Event 1',
              eventDate: '2023-01-01',
              participationStatus: 'Confirmed'
            }
          ]
        }
      ];

      getVolunteerData.mockResolvedValue(mockVolunteerData);

      // Act
      const response = await request(app)
        .get('/report/download/volunteers/pdf')
        .expect('Content-Type', /application\/pdf/)
        .expect(200);

      // Assert
      expect(getVolunteerData).toHaveBeenCalled();
      expect(pdfkit).toHaveBeenCalled();
      expect(mockPdf.pipe).toHaveBeenCalled();
      expect(mockPdf.text).toHaveBeenCalled();
      expect(mockPdf.end).toHaveBeenCalled();
    });

    it('should handle empty volunteer data', async () => {
      // Arrange
      getVolunteerData.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .get('/report/download/volunteers/pdf')
        .expect('Content-Type', /application\/pdf/)
        .expect(200);

      // Assert
      expect(getVolunteerData).toHaveBeenCalled();
      expect(pdfkit).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      // Arrange
      getVolunteerData.mockRejectedValue(new Error('Service error'));

      // Act & Assert
      await request(app)
        .get('/report/download/volunteers/pdf')
        .expect(500);
    });
    it('should handle volunteers with no event history in PDF', async () => {
      // Arrange
      const mockVolunteerData = [
        {
          name: 'Jane Doe',
          phone: '987-654-3210',
          address: '456 Sample St',
          city: 'Sample City',
          state: 'SC',
          zip: '54321',
          skills: ['skillA', 'skillB'],
          totalEvents: 0,
          history: []  // 👈 KEY: No history triggers the else
        }
      ];

      getVolunteerData.mockResolvedValue(mockVolunteerData);

      // Act
      const response = await request(app)
        .get('/report/download/volunteers/pdf')
        .expect('Content-Type', /application\/pdf/)
        .expect(200);

      // Assert
      expect(mockPdf.text).toHaveBeenCalledWith('Event History: None');
    });
    it('should handle events with no matched volunteers in PDF', async () => {
      // Arrange
      const mockEventData = [
        {
          eventname: 'Event Without Matches',
          address: '789 Empty St',
          city: 'Nowhere',
          state: 'NW',
          zip: '00000',
          requiredSkills: 'skillX',
          availability: '2025-08-01',
          urgency: 'Low',
          createdAt: '2025-08-01',
          matchedVolunteers: [] // 👈 empty list to trigger the else block
        }
      ];

      getEventData.mockResolvedValue(mockEventData);

      // Act
      const response = await request(app)
        .get('/report/download/events/pdf')
        .expect('Content-Type', /application\/pdf/)
        .expect(200);

      // Assert
      expect(mockPdf.text).toHaveBeenCalledWith('Matched Volunteers: None');
    });

    it('should handle events with mixed date formats in PDF', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      getVolunteerData.mockResolvedValue([
        {
          name: 'Ali Test',
          city: 'City',
          state: 'ST',
          zip: '99999',
          skills: ['Tutoring'],
          totalEvents: 2,
          history: [
            {
              eventName: 'With toDate()',
              eventDate: { toDate: () => new Date(today.getTime() + 86400000) } // tomorrow
            },
            {
              eventName: 'Raw ISO',
              eventDate: today.toISOString()
            },
            {
              eventName: 'Invalid',
              eventDate: 'not-a-real-date'
            },
            {
              // No eventName and no eventDate
            }
          ]
        }
      ]);

      await request(app)
        .get('/report/download/volunteers/pdf')
        .expect('Content-Type', /application\/pdf/)
        .expect(200);

      // Assert fallback labels and logic paths
      expect(mockPdf.text).toHaveBeenCalledWith(
        expect.stringMatching(/With toDate.*Upcoming|Completed/)
      );
      expect(mockPdf.text).toHaveBeenCalledWith(
        expect.stringMatching(/Raw ISO.*Upcoming|Completed/)
      );
      expect(mockPdf.text).toHaveBeenCalledWith(
        expect.stringMatching(/Invalid.*—/)
      );
      expect(mockPdf.text).toHaveBeenCalledWith(
        expect.stringMatching(/Unnamed Event.*Unknown/)
      );
    });

  });

  describe('GET /download/volunteers/csv', () => {
    it('should generate volunteer CSV report successfully', async () => {
      // Arrange
      const mockVolunteerData = [
        {
          name: 'John Doe',
          phone: '123-456-7890',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          skills: ['skill1', 'skill2'],
          totalEvents: 2,
          history: [
            {
              eventName: 'Event 1',
              eventDate: '2023-01-01',
              participationStatus: 'Confirmed'
            }
          ]
        }
      ];

      getVolunteerData.mockResolvedValue(mockVolunteerData);
      stringify.mockImplementation((data, options, callback) => {
        callback(null, 'csv,data,here');
      });

      // Act
      const response = await request(app)
        .get('/report/download/volunteers/csv')
        .expect('Content-Type', /text\/csv/)
        .expect(200);

      // Assert
      expect(getVolunteerData).toHaveBeenCalled();
      expect(stringify).toHaveBeenCalled();
    });

    it('should handle CSV generation errors', async () => {
      // Arrange
      getVolunteerData.mockResolvedValue([]);
      stringify.mockImplementation((data, options, callback) => {
        callback(new Error('CSV error'));
      });

      // Act & Assert
      await request(app)
        .get('/report/download/volunteers/csv')
        .expect(500);
    });

    it('should handle service errors', async () => {
      // Arrange
      getVolunteerData.mockRejectedValue(new Error('Service error'));

      // Act & Assert
      await request(app)
        .get('/report/download/volunteers/csv')
        .expect(500);
    });
    it('should handle volunteers with no event history in CSV', async () => {
      getVolunteerData.mockResolvedValue([
        {
          name: 'Jane Doe',
          city: 'Austin',
          state: 'TX',
          zip: '73301',
          skills: ['Tutoring'],
          totalEvents: 0,
          history: [] // 👈 ensures else block is hit
        }
      ]);

      stringify.mockImplementation((data, options, callback) => {
        callback(null, 'Volunteer Name,City,State,Zip,Skills,Total Events,Event Name,Participation Status,Event Date\nJane Doe,Austin,TX,73301,"Tutoring",0,N/A,N/A,N/A');
      });

      await request(app)
        .get('/report/download/volunteers/csv')
        .expect('Content-Type', /text\/csv/)
        .expect(200);

      expect(getVolunteerData).toHaveBeenCalled();
      expect(stringify).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ 'Volunteer Name': 'Jane Doe', 'Event Name': 'N/A' })
        ]),
        expect.any(Object),
        expect.any(Function)
      );
    });
  it('should correctly determine participation status for various eventDate formats in CSV', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today.getTime() + 86400000); // 1 day ahead
      const yesterday = new Date(today.getTime() - 86400000); // 1 day before

      getVolunteerData.mockResolvedValue([
        {
          name: 'Ali Test',
          city: 'Testville',
          state: 'TS',
          zip: '12345',
          skills: ['Skill A'],
          totalEvents: 3,
          history: [
            {
              eventName: 'Tomorrow Event',
              eventDate: { toDate: () => tomorrow }
            },
            {
              eventName: 'Yesterday Event',
              eventDate: yesterday.toISOString()
            },
            {
              eventName: 'Invalid Date',
              eventDate: 'not-a-date'
            }
          ]
        }
      ]);

      stringify.mockImplementation((data, options, callback) => {
        callback(null, 'csv,data,here');
      });

      await request(app)
        .get('/report/download/volunteers/csv')
        .expect('Content-Type', /text\/csv/)
        .expect(200);

      // Verify CSV input rows sent to stringify
      const [[csvRows]] = stringify.mock.calls;

      const statuses = csvRows.map(row => row['Participation Status']);
      const eventNames = csvRows.map(row => row['Event Name']);

      expect(eventNames).toContain('Tomorrow Event');
      expect(eventNames).toContain('Yesterday Event');
      expect(eventNames).toContain('Invalid Date');

      expect(statuses).toContain('Upcoming');
      expect(statuses).toContain('Completed');
      expect(statuses).toContain('—');
    });
  });

  describe('GET /download/events/pdf', () => {
    it('should generate event PDF report successfully', async () => {
      // Arrange
      const mockEventData = [
        {
          eventname: 'Test Event',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          requiredSkills: 'skill1, skill2',
          availability: '2023-01-01, 2023-01-02',
          urgency: 'Medium',
          createdAt: '2023-01-01',
          matchedVolunteers: [
            {
              volunteerName: 'John Doe',
              matchedSkills: 'skill1, skill2'
            }
          ]
        }
      ];

      getEventData.mockResolvedValue(mockEventData);

      // Act
      const response = await request(app)
        .get('/report/download/events/pdf')
        .expect('Content-Type', /application\/pdf/)
        .expect(200);

      // Assert
      expect(getEventData).toHaveBeenCalled();
      expect(pdfkit).toHaveBeenCalled();
      expect(mockPdf.pipe).toHaveBeenCalled();
      expect(mockPdf.text).toHaveBeenCalled();
      expect(mockPdf.end).toHaveBeenCalled();
    });
    it('should render full event info including address and urgency in PDF', async () => {
      // Arrange
      const mockEventData = [
        {
          eventname: 'Detailed Event',
          address: '123 Main St',
          address2: 'Suite 100',
          city: 'Houston',
          state: 'TX',
          zip: '77001',
          requiredSkills: 'Teaching, First Aid',
          availability: '2025-08-10, 2025-08-12',
          urgency: 'High',
          createdAt: '2025-08-01',
          matchedVolunteers: [
            {
              volunteerName: 'Alice Smith',
              matchedSkills: 'First Aid'
            }
          ]
        }
      ];

      getEventData.mockResolvedValue(mockEventData);

      // Act
      const response = await request(app)
        .get('/report/download/events/pdf')
        .expect('Content-Type', /application\/pdf/)
        .expect(200);

      // Assert
      expect(getEventData).toHaveBeenCalled();
      expect(mockPdf.text).toHaveBeenCalledWith(
        expect.stringContaining('Detailed Event'),
        expect.objectContaining({ continued: false })
      );
      expect(mockPdf.text).toHaveBeenCalledWith(
        expect.stringContaining('Address: 123 Main St, Suite 100')
      );
      expect(mockPdf.text).toHaveBeenCalledWith(
        expect.stringContaining('City/State/Zip: Houston, TX 77001')
      );
      expect(mockPdf.text).toHaveBeenCalledWith(
        expect.stringContaining('Event Dates: 2025-08-10, 2025-08-12')
      );
      expect(mockPdf.text).toHaveBeenCalledWith(
        expect.stringContaining('Urgency Level: High')
      );
    });

    it('should handle empty event data', async () => {
      // Arrange
      getEventData.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .get('/report/download/events/pdf')
        .expect('Content-Type', /application\/pdf/)
        .expect(200);

      // Assert
      expect(getEventData).toHaveBeenCalled();
      expect(pdfkit).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      // Arrange
      getEventData.mockRejectedValue(new Error('Service error'));

      // Act & Assert
      await request(app)
        .get('/report/download/events/pdf')
        .expect(500);
    });
  });

  describe('GET /download/events/csv', () => {
    it('should generate event CSV report successfully', async () => {
      // Arrange
      const mockEventData = [
        {
          eventname: 'Test Event',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          requiredSkills: 'skill1, skill2',
          availability: '2023-01-01, 2023-01-02',
          urgency: 'Medium',
          createdAt: '2023-01-01',
          matchedVolunteers: [
            {
              volunteerName: 'John Doe',
              matchedSkills: 'skill1, skill2'
            }
          ]
        }
      ];

      getEventData.mockResolvedValue(mockEventData);
      stringify.mockImplementation((data, options, callback) => {
        callback(null, 'csv,data,here');
      });

      // Act
      const response = await request(app)
        .get('/report/download/events/csv')
        .expect('Content-Type', /text\/csv/)
        .expect(200);

      // Assert
      expect(getEventData).toHaveBeenCalled();
      expect(stringify).toHaveBeenCalled();
    });

    it('should handle CSV generation errors', async () => {
      // Arrange
      getEventData.mockResolvedValue([]);
      stringify.mockImplementation((data, options, callback) => {
        callback(new Error('CSV error'));
      });

      // Act & Assert
      await request(app)
        .get('/report/download/events/csv')
        .expect(500);
    });

    it('should handle service errors', async () => {
      // Arrange
      getEventData.mockRejectedValue(new Error('Service error'));

      // Act & Assert
      await request(app)
        .get('/report/download/events/csv')
        .expect(500);
    });
    it('should handle events with no matched volunteers', async () => {
  // Arrange
    const mockEventData = [
      {
        eventname: 'Solo Event',
        address: '456 Empty St',
        city: 'Alone City',
        state: 'AC',
        zip: '00000',
        availability: '2025-08-10',
        urgency: 'Low',
        requiredSkills: 'None',
        matchedVolunteers: [] // ✅ No matched volunteers
      }
    ];

    getEventData.mockResolvedValue(mockEventData);
    stringify.mockImplementation((data, options, callback) => {
      callback(null, 'csv,data,here');
    });

    // Act
    const response = await request(app)
      .get('/report/download/events/csv')
      .expect('Content-Type', /text\/csv/)
      .expect(200);

    // Assert
    expect(getEventData).toHaveBeenCalled();
    expect(stringify).toHaveBeenCalled();

    // Optional: verify 'Volunteer Name' and 'Matched Skills' are 'N/A' in the row data
    const [[csvRow]] = stringify.mock.calls;
    expect(csvRow[0]['Volunteer Name']).toBe('N/A');
    expect(csvRow[0]['Matched Skills']).toBe('N/A');
  });
  it('should handle empty event list and generate CSV with no rows', async () => {
  // Arrange
  getEventData.mockResolvedValue([]);

  stringify.mockImplementation((data, options, callback) => {
    callback(null, 'csv,data,here');
  });

  // Act
  const response = await request(app)
    .get('/report/download/events/csv')
    .expect('Content-Type', /text\/csv/)
    .expect(200);

  // Assert
  expect(getEventData).toHaveBeenCalled();
  expect(stringify).toHaveBeenCalledWith([], expect.any(Object), expect.any(Function));
});
it('should handle events with no matched volunteers in CSV', async () => {
  // Arrange
  const mockEventData = [
    {
      eventname: 'Unmatched Event',
      address: '101 Solo St',
      address2: '',
      city: 'Emptytown',
      state: 'EM',
      zip: '00000',
      availability: '2025-09-01',
      urgency: 'Low',
      requiredSkills: 'Teaching',
      matchedVolunteers: [] // 👈 triggers the else block
    }
  ];

    getEventData.mockResolvedValue(mockEventData);
    stringify.mockImplementation((data, options, callback) => {
      callback(null, 'csv,data,here');
    });

    // Act
    await request(app)
      .get('/report/download/events/csv')
      .expect('Content-Type', /text\/csv/)
      .expect(200);

    // Assert
    const [[csvRows]] = stringify.mock.calls;

    expect(csvRows[0]['Event Name']).toBe('Unmatched Event');
    expect(csvRows[0]['Volunteer Name']).toBe('N/A');
    expect(csvRows[0]['Matched Skills']).toBe('N/A');
  });
  
  });
}); 