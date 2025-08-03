const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { getEventData } = require('../utils/reportService');

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
