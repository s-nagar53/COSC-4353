module.exports = {
  matches: [],
  matchIdCounter: 1,
  
  // Helper function to get matches by event ID
  getMatchesByEventId: function(eventId) {
    return this.matches.filter(match => match.eventId === eventId);
  }
};