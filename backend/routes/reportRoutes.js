const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { stringify } = require('csv-stringify');
const { getVolunteerData, getEventData  } = require('../utils/reportService');

// New route for downloading the volunteer history PDF (formatted like event history)
router.get('/report/download/volunteers/pdf', async (req, res) => {
  try {
    const volunteers = await getVolunteerData();

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Disposition', 'attachment; filename=volunteer_history.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Title
    doc.fontSize(20).fillColor('#333').text('Volunteer History Report', {
      align: 'center',
      underline: true,
    }).moveDown(1.5);

    volunteers.forEach((vol, index) => {
      doc
        .fontSize(14)
        .fillColor('black')
        .text(`${index + 1}. ${vol.name}`, { continued: false })
        .moveDown(0.5);

      doc
        .fontSize(11)
        .fillColor('#333')
        //.text(`Email: ${vol.email || 'N/A'}`)
        .text(`Location: ${vol.city || '—'}, ${vol.state || '—'} ${vol.zip || ''}`)
        .text(`Skills: ${(vol.skills || []).join(', ') || 'None listed'}`)
        .text(`Total Events: ${vol.totalEvents || 0}`);
        /*
      if (vol.history && vol.history.length > 0) {
        doc.moveDown(0.5).text('Event History:', { underline: true });
        vol.history.forEach((event, i) => {
          doc.text(
            `  • ${event.eventName || 'Unnamed Event'} on ${event.eventDate || 'Unknown date'} (${event.participationStatus || '—'})`
          );
        });
      } */ if (vol.history && vol.history.length > 0) {
        doc.moveDown(0.5).text('Event History:', { underline: true });

        vol.history.forEach((event, i) => {
          let eventDate = event.eventDate?.toDate
            ? event.eventDate.toDate()
            : new Date(event.eventDate);
          let status = '—';

          if (!isNaN(eventDate)) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            eventDate.setHours(0, 0, 0, 0);
            status = eventDate >= today ? 'Upcoming' : 'Completed';
          }

          doc.text(
            `  • ${event.eventName || 'Unnamed Event'} on ${event.eventDate || 'Unknown date'} (${status})`
          );
        });
      }
      else {
        doc.moveDown(0.5).text('Event History: None');
      }

      doc.moveDown(1.5).moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).strokeColor('#ccc').stroke().moveDown(1);
    });

    doc.end();
  } catch (error) {
    console.error('Error generating volunteer history PDF:', error);
    res.status(500).json({
      message: 'Failed to generate PDF report',
      error: error.message
    });
  }
});


// New route for downloading the volunteer history CSV
router.get('/report/download/volunteers/csv', async (req, res) => {
  try {
    const volunteers = await getVolunteerData();
    const csvData = [];
    volunteers.forEach(volunteer => {
      if (volunteer.history && volunteer.history.length > 0) {
        volunteer.history.forEach(event => {
          csvData.push({
            'Volunteer Name': volunteer.name,
            //'Email': volunteer.email,
            'City': volunteer.city,
            'State': volunteer.state,
            'Zip': volunteer.zip,
            'Skills': volunteer.skills,
            'Total Events': volunteer.totalEvents,
            'Event Name': event.eventName,
            'Participation Status': event.participationStatus,
            'Event Date': event.eventDate,
          });
        });
      } else {
         csvData.push({
            'Volunteer Name': volunteer.name,
            //'Email': volunteer.email,
            'City': volunteer.city,
            'State': volunteer.state,
            'Zip': volunteer.zip,
            'Skills': volunteer.skills,
            'Total Events': volunteer.totalEvents,
            'Event Name': 'N/A',
            'Participation Status': 'N/A',
            'Event Date': 'N/A',
          });
      }
    });
    const headers = [
      'Volunteer Name', /*'Email',*/ 'City', 'State', 'Zip', 'Skills',
      'Total Events', 'Event Name', 'Participation Status', 'Event Date'
    ];
    stringify(csvData, { header: true, columns: headers }, (err, output) => {
      if (err) throw err;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="volunteer_history.csv"');
      res.send(output);
    });
  } catch (error) {
    console.error('Error generating CSV report:', error);
    res.status(500).json({ message: 'Failed to generate CSV report', error: error.message });
  }
});

router.get('/report/download/events/pdf', async (req, res) => {
  try {
    const data = await getEventData();

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Disposition', 'attachment; filename=event_history.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Title
    doc.fontSize(20).fillColor('#333').text('Event History Report', {
      align: 'center',
      underline: true,
    }).moveDown(1.5);

    data.forEach((event, index) => {

      doc
        .fontSize(14)
        .fillColor('black')
        .text(`${index + 1}. ${event.eventname || 'Untitled Event'}`, { continued: false })
        .moveDown(0.5);

      doc
        .fontSize(11)
        .fillColor('#333')
        .text(`Address: ${event.address}${event.address2 ? ', ' + event.address2 : ''}`)
        .text(`City/State/Zip: ${event.city}, ${event.state} ${event.zip}`)
        .text(`Event Dates: ${event.availability}`)
        .text(`Urgency Level: ${event.urgency || 'N/A'}`)
        .text(`Required Skills: ${event.requiredSkills}`);

      // Volunteers section
      if (event.matchedVolunteers && event.matchedVolunteers.length > 0) {
        doc.moveDown(0.5).text(`Matched Volunteers:`, { underline: true });
        event.matchedVolunteers.forEach((vol, i) => {
          doc.text(`  • ${vol.volunteerName} (Skills: ${vol.matchedSkills})`);
        });
      } else {
        doc.moveDown(0.5).text(`Matched Volunteers: None`);
      }

      doc.moveDown(1.5).moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).strokeColor('#ccc').stroke().moveDown(1);
    });

    doc.end();
  } catch (err) {
    console.error('Error generating event history PDF:', err);
    res.status(500).send('Failed to generate event history report.');
  }
});

module.exports = router;
