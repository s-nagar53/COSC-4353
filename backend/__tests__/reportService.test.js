const { getEventData, getVolunteerData } = require('../utils/reportService');

// Mock Firebase
jest.mock('../firebase', () => {
  const mockGet = jest.fn();
  const mockWhere = jest.fn();
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();

  return {
    db: {
      collection: mockCollection
    }
  };
});

describe('🔍 ReportService', () => {
  let mockDb;
  let mockCollection;
  let mockWhere;
  let mockGet;
  let mockDoc;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mocked Firebase functions
    const { db } = require('../firebase');
    mockDb = db;
    mockCollection = db.collection;
    mockWhere = jest.fn();
    mockGet = jest.fn();
    mockDoc = jest.fn();

    // Setup mock chain
    mockCollection.mockReturnValue({
      where: mockWhere,
      get: mockGet,
      doc: mockDoc
    });
    mockWhere.mockReturnValue({
      get: mockGet
    });
    mockGet.mockReturnValue({
      docs: []
    });
    mockDoc.mockReturnValue({
      get: mockGet
    });
  });

  describe('getEventData', () => {
    it('should fetch and format event data successfully', async () => {
      // Arrange
      const mockEventSnapshot = {
        docs: [
          {
            data: () => ({
              eid: 'event-1',
              eventname: 'Test Event',
              address: '123 Test St',
              address2: 'Apt 1',
              city: 'Test City',
              state: 'TS',
              zip: '12345',
              requiredSkills: ['skill1', 'skill2'],
              availability: ['2023-01-01', '2023-01-02'],
              urgency: '2',
              createdAt: { toDate: () => new Date('2023-01-01') }
            })
          }
        ]
      };

      const mockMatchSnapshot = {
        docs: [
          {
            data: () => ({
              eventId: 'event-1',
              volunteerName: 'John Doe',
              matchedSkills: ['skill1', 'skill2']
            })
          }
        ]
      };

      // Mock forEach for both snapshots
      mockEventSnapshot.forEach = jest.fn((callback) => {
        mockEventSnapshot.docs.forEach(callback);
      });
      mockMatchSnapshot.forEach = jest.fn((callback) => {
        mockMatchSnapshot.docs.forEach(callback);
      });

      mockGet
        .mockResolvedValueOnce(mockEventSnapshot) // events
        .mockResolvedValueOnce(mockMatchSnapshot); // matches

      // Act
      const result = await getEventData();

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('events');
      expect(mockCollection).toHaveBeenCalledWith('matches');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        eventname: 'Test Event',
        address: '123 Test St',
        address2: 'Apt 1',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        requiredSkills: 'skill1, skill2',
        availability: '2023-01-01, 2023-01-02',
        urgency: 'Medium',
        createdAt: expect.any(String),
        matchedVolunteers: [
          {
            volunteerName: 'John Doe',
            matchedSkills: 'skill1, skill2'
          }
        ]
      });
    });

    it('should handle events with missing data', async () => {
      // Arrange
      const mockEventSnapshot = {
        docs: [
          {
            data: () => ({
              eid: 'event-1'
              // Missing most fields
            })
          }
        ]
      };

      const mockMatchSnapshot = {
        docs: []
      };

      // Mock forEach for both snapshots
      mockEventSnapshot.forEach = jest.fn((callback) => {
        mockEventSnapshot.docs.forEach(callback);
      });
      mockMatchSnapshot.forEach = jest.fn((callback) => {
        mockMatchSnapshot.docs.forEach(callback);
      });

      mockGet
        .mockResolvedValueOnce(mockEventSnapshot)
        .mockResolvedValueOnce(mockMatchSnapshot);

      // Act
      const result = await getEventData();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        eventname: 'Untitled Event',
        address: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        requiredSkills: '',
        availability: '',
        urgency: 'Unknown',
        createdAt: 'N/A',
        matchedVolunteers: []
      });
    });

    it('should handle multiple events with different urgency levels', async () => {
      // Arrange
      const mockEventSnapshot = {
        docs: [
          {
            data: () => ({
              eid: 'event-1',
              eventname: 'Event 1',
              urgency: '1'
            })
          },
          {
            data: () => ({
              eid: 'event-2',
              eventname: 'Event 2',
              urgency: '3'
            })
          },
          {
            data: () => ({
              eid: 'event-3',
              eventname: 'Event 3',
              urgency: '4'
            })
          }
        ]
      };

      const mockMatchSnapshot = {
        docs: []
      };

      // Mock forEach for both snapshots
      mockEventSnapshot.forEach = jest.fn((callback) => {
        mockEventSnapshot.docs.forEach(callback);
      });
      mockMatchSnapshot.forEach = jest.fn((callback) => {
        mockMatchSnapshot.docs.forEach(callback);
      });

      mockGet
        .mockResolvedValueOnce(mockEventSnapshot)
        .mockResolvedValueOnce(mockMatchSnapshot);

      // Act
      const result = await getEventData();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].urgency).toBe('Low');
      expect(result[1].urgency).toBe('High');
      expect(result[2].urgency).toBe('Critical');
    });

    it('should handle events with no matches', async () => {
      // Arrange
      const mockEventSnapshot = {
        docs: [
          {
            data: () => ({
              eid: 'event-1',
              eventname: 'Test Event'
            })
          }
        ]
      };

      const mockMatchSnapshot = {
        docs: []
      };

      // Mock forEach for both snapshots
      mockEventSnapshot.forEach = jest.fn((callback) => {
        mockEventSnapshot.docs.forEach(callback);
      });
      mockMatchSnapshot.forEach = jest.fn((callback) => {
        mockMatchSnapshot.docs.forEach(callback);
      });

      mockGet
        .mockResolvedValueOnce(mockEventSnapshot)
        .mockResolvedValueOnce(mockMatchSnapshot);

      // Act
      const result = await getEventData();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].matchedVolunteers).toEqual([]);
    });

    it('should handle events with multiple matches', async () => {
      // Arrange
      const mockEventSnapshot = {
        docs: [
          {
            data: () => ({
              eid: 'event-1',
              eventname: 'Test Event'
            })
          }
        ]
      };

      const mockMatchSnapshot = {
        docs: [
          {
            data: () => ({
              eventId: 'event-1',
              volunteerName: 'John Doe',
              matchedSkills: ['skill1']
            })
          },
          {
            data: () => ({
              eventId: 'event-1',
              volunteerName: 'Jane Smith',
              matchedSkills: ['skill2']
            })
          }
        ]
      };

      // Mock forEach for both snapshots
      mockEventSnapshot.forEach = jest.fn((callback) => {
        mockEventSnapshot.docs.forEach(callback);
      });
      mockMatchSnapshot.forEach = jest.fn((callback) => {
        mockMatchSnapshot.docs.forEach(callback);
      });

      mockGet
        .mockResolvedValueOnce(mockEventSnapshot)
        .mockResolvedValueOnce(mockMatchSnapshot);

      // Act
      const result = await getEventData();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].matchedVolunteers).toHaveLength(2);
      expect(result[0].matchedVolunteers[0].volunteerName).toBe('John Doe');
      expect(result[0].matchedVolunteers[1].volunteerName).toBe('Jane Smith');
    });
  });

  describe('getVolunteerData', () => {
    it('should fetch and format volunteer data successfully', async () => {
      // Arrange
      const mockVolunteersSnapshot = {
        docs: [
          {
            id: 'vol-1',
            data: () => ({
              name: 'John Doe',
              phone: '123-456-7890',
              address: '123 Test St',
              city: 'Test City',
              state: 'TS',
              zip: '12345',
              skills: ['skill1', 'skill2']
            })
          }
        ]
      };

      const mockMatchesSnapshot = {
        docs: [
          {
            data: () => ({
              volunteerId: 'vol-1',
              eventId: 'event-1',
              matchStatus: 'Confirmed'
            })
          }
        ]
      };

      const mockEventDoc = {
        id: 'event-1',
        exists: true,
        data: () => ({
          eventname: 'Test Event',
          availability: ['2023-01-01'],
          address: '456 Event St',
          city: 'Event City',
          state: 'ES',
          zip: '54321'
        })
      };

      // Mock forEach for snapshots
      mockVolunteersSnapshot.forEach = jest.fn((callback) => {
        mockVolunteersSnapshot.docs.forEach(callback);
      });
      mockMatchesSnapshot.forEach = jest.fn((callback) => {
        mockMatchesSnapshot.docs.forEach(callback);
      });

      // Mock the event document fetching by eventId
      mockDoc.mockImplementation((eid) => ({
        get: jest.fn().mockResolvedValue(mockEventDoc)
      }));

      mockGet
        .mockResolvedValueOnce(mockVolunteersSnapshot) // volunteers
        .mockResolvedValueOnce(mockMatchesSnapshot); // matches

      // Act
      const result = await getVolunteerData();

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockWhere).toHaveBeenCalledWith('role', '==', 'volunteer');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'John Doe',
        phone: '123-456-7890',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        skills: ['skill1', 'skill2'],
        totalEvents: 1,
        history: [
          {
            eventName: 'Test Event',
            eventDate: '2023-01-01',
            participationStatus: 'Confirmed',
            address: '456 Event St',
            city: 'Event City',
            state: 'ES',
            zip: '54321'
          }
        ]
      });
    });

    it('should handle volunteers with missing data', async () => {
      // Arrange
      const mockVolunteersSnapshot = {
        docs: [
          {
            id: 'vol-1',
            data: () => ({
              name: 'John Doe'
              // Missing most fields
            })
          }
        ]
      };

      const mockMatchesSnapshot = {
        docs: []
      };

      // Mock forEach for snapshots
      mockVolunteersSnapshot.forEach = jest.fn((callback) => {
        mockVolunteersSnapshot.docs.forEach(callback);
      });
      mockMatchesSnapshot.forEach = jest.fn((callback) => {
        mockMatchesSnapshot.docs.forEach(callback);
      });

      mockGet
        .mockResolvedValueOnce(mockVolunteersSnapshot)
        .mockResolvedValueOnce(mockMatchesSnapshot);

      // Act
      const result = await getVolunteerData();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'John Doe',
        phone: 'N/A',
        address: 'N/A',
        city: 'N/A',
        state: 'N/A',
        zip: 'N/A',
        skills: [],
        totalEvents: 0,
        history: []
      });
    });

    it('should handle volunteers with no matches', async () => {
      // Arrange
      const mockVolunteersSnapshot = {
        docs: [
          {
            id: 'vol-1',
            data: () => ({
              name: 'John Doe',
              skills: ['skill1']
            })
          }
        ]
      };

      const mockMatchesSnapshot = {
        docs: []
      };

      // Mock forEach for snapshots
      mockVolunteersSnapshot.forEach = jest.fn((callback) => {
        mockVolunteersSnapshot.docs.forEach(callback);
      });
      mockMatchesSnapshot.forEach = jest.fn((callback) => {
        mockMatchesSnapshot.docs.forEach(callback);
      });

      mockGet
        .mockResolvedValueOnce(mockVolunteersSnapshot)
        .mockResolvedValueOnce(mockMatchesSnapshot);

      // Act
      const result = await getVolunteerData();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].totalEvents).toBe(0);
      expect(result[0].history).toEqual([]);
    });

    it('should handle volunteers with multiple matches', async () => {
      // Arrange
      const mockVolunteersSnapshot = {
        docs: [
          {
            id: 'vol-1',
            data: () => ({
              name: 'John Doe',
              skills: ['skill1']
            })
          }
        ]
      };

      const mockMatchesSnapshot = {
        docs: [
          {
            data: () => ({
              volunteerId: 'vol-1',
              eventId: 'event-1',
              matchStatus: 'Confirmed'
            })
          },
          {
            data: () => ({
              volunteerId: 'vol-1',
              eventId: 'event-2',
              matchStatus: 'Pending'
            })
          }
        ]
      };

      const mockEventDoc1 = {
        id: 'event-1',
        exists: true,
        data: () => ({
          eventname: 'Event 1',
          availability: ['2023-01-01'],
          address: '123 St',
          city: 'City 1',
          state: 'S1',
          zip: '11111'
        })
      };

      const mockEventDoc2 = {
        id: 'event-2',
        exists: true,
        data: () => ({
          eventname: 'Event 2',
          availability: ['2023-02-01'],
          address: '456 St',
          city: 'City 2',
          state: 'S2',
          zip: '22222'
        })
      };

      // Mock forEach for snapshots
      mockVolunteersSnapshot.forEach = jest.fn((callback) => {
        mockVolunteersSnapshot.docs.forEach(callback);
      });
      mockMatchesSnapshot.forEach = jest.fn((callback) => {
        mockMatchesSnapshot.docs.forEach(callback);
      });

      // Mock the event document fetching by eventId
      mockDoc.mockImplementation((eid) => ({
        get: jest.fn().mockResolvedValue(
          eid === 'event-1' ? mockEventDoc1 : mockEventDoc2
        )
      }));

      mockGet
        .mockResolvedValueOnce(mockVolunteersSnapshot)
        .mockResolvedValueOnce(mockMatchesSnapshot);

      // Act
      const result = await getVolunteerData();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].totalEvents).toBe(2);
      expect(result[0].history).toHaveLength(2);
      expect(result[0].history[0].eventName).toBe('Event 1');
      expect(result[0].history[1].eventName).toBe('Event 2');
    });

    it('should handle non-existent events gracefully', async () => {
      // Arrange
      const mockVolunteersSnapshot = {
        docs: [
          {
            id: 'vol-1',
            data: () => ({
              name: 'John Doe',
              skills: ['skill1']
            })
          }
        ]
      };

      const mockMatchesSnapshot = {
        docs: [
          {
            data: () => ({
              volunteerId: 'vol-1',
              eventId: 'event-1',
              matchStatus: 'Confirmed'
            })
          }
        ]
      };

      const mockEventDoc = {
        exists: false,
        data: () => ({})
      };

      // Mock forEach for snapshots
      mockVolunteersSnapshot.forEach = jest.fn((callback) => {
        mockVolunteersSnapshot.docs.forEach(callback);
      });
      mockMatchesSnapshot.forEach = jest.fn((callback) => {
        mockMatchesSnapshot.docs.forEach(callback);
      });

      mockGet
        .mockResolvedValueOnce(mockVolunteersSnapshot)
        .mockResolvedValueOnce(mockMatchesSnapshot)
        .mockResolvedValue(mockEventDoc);

      // Act
      const result = await getVolunteerData();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].totalEvents).toBe(0);
      expect(result[0].history).toEqual([]);
    });

    it('should handle events with missing availability dates', async () => {
      // Arrange
      const mockVolunteersSnapshot = {
        docs: [
          {
            id: 'vol-1',
            data: () => ({
              name: 'John Doe',
              skills: ['skill1']
            })
          }
        ]
      };

      const mockMatchesSnapshot = {
        docs: [
          {
            data: () => ({
              volunteerId: 'vol-1',
              eventId: 'event-1',
              matchStatus: 'Confirmed'
            })
          }
        ]
      };

      const mockEventDoc = {
        id: 'event-1',
        exists: true,
        data: () => ({
          eventname: 'Test Event',
          availability: null, // Missing availability
          address: '123 St',
          city: 'Test City',
          state: 'TS',
          zip: '12345'
        })
      };

      // Mock forEach for snapshots
      mockVolunteersSnapshot.forEach = jest.fn((callback) => {
        mockVolunteersSnapshot.docs.forEach(callback);
      });
      mockMatchesSnapshot.forEach = jest.fn((callback) => {
        mockMatchesSnapshot.docs.forEach(callback);
      });

      // Mock the event document fetching by eventId
      mockDoc.mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(mockEventDoc)
      }));

      mockGet
        .mockResolvedValueOnce(mockVolunteersSnapshot)
        .mockResolvedValueOnce(mockMatchesSnapshot);

      // Act
      const result = await getVolunteerData();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].history[0].eventDate).toBe('N/A');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockGet.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(getVolunteerData()).rejects.toThrow('Failed to fetch volunteer data');
    });
  });
}); 