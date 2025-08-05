const request = require('supertest');
const express = require('express');

// Mock the dependencies
jest.mock('../utils/reportService');
jest.mock('pdfkit');
jest.mock('csv-stringify', () => jest.fn());

const { getVolunteerData, getEventData } = require('../utils/reportService');
const pdfkit = require('pdfkit');
const csvStringify = require('csv-stringify');

describe('🔍 ReportRoutes', () => {
  let app;
  let mockPdf;
  let mockCsvStringify;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock PDFKit
    mockPdf = {
      pipe: jest.fn().mockReturnThis(),
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
    csvStringify.mockImplementation(mockCsvStringify);

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
      mockCsvStringify.mockImplementation((data, options, callback) => {
        callback(null, 'csv,data,here');
      });

      // Act
      const response = await request(app)
        .get('/report/download/volunteers/csv')
        .expect('Content-Type', /text\/csv/)
        .expect(200);

      // Assert
      expect(getVolunteerData).toHaveBeenCalled();
      expect(csvStringify).toHaveBeenCalled();
    });

    it('should handle CSV generation errors', async () => {
      // Arrange
      getVolunteerData.mockResolvedValue([]);
      mockCsvStringify.mockImplementation((data, options, callback) => {
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
      mockCsvStringify.mockImplementation((data, options, callback) => {
        callback(null, 'csv,data,here');
      });

      // Act
      const response = await request(app)
        .get('/report/download/events/csv')
        .expect('Content-Type', /text\/csv/)
        .expect(200);

      // Assert
      expect(getEventData).toHaveBeenCalled();
      expect(csvStringify).toHaveBeenCalled();
    });

    it('should handle CSV generation errors', async () => {
      // Arrange
      getEventData.mockResolvedValue([]);
      mockCsvStringify.mockImplementation((data, options, callback) => {
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
  });
}); 