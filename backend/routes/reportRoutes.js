/*const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { getEventData } = require('../utils/reportService');

router.get('/report/download/events/pdf', async (req, res) => {
  try {
    const data = await getEventData();

    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filename=event_history.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

   doc.fontSize(18).text('Event History Report', { align: 'center' }).moveDown();

    data.forEach((event, index) => {
    doc.fontSize(12).text(`${index + 1}. ${event.eventname}`);
    doc.text(`   Address: ${event.address}${event.address2 ? ', ' + event.address2 : ''}`);
    doc.text(`   City: ${event.city}, ${event.state} ${event.zip}`);
    doc.text(`   Created: ${event.createdAt}`);
    doc.text(`   Urgency: ${event.urgency}`);
    doc.text(`   Required Skills: ${event.requiredSkills}`);
    doc.text(`   Availability: ${event.availability}`);

     if (event.matchedVolunteers.length > 0) {
        doc.moveDown(0.5).text(`   Matched Volunteers:`);
        event.matchedVolunteers.forEach((vol, i) => {
        doc.text(`     - ${vol.volunteerName} (Skills: ${vol.matchedSkills})`);
        });
    } else {
        doc.moveDown(0.5).text(`   Matched Volunteers: None`);
    }
    doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('Error generating event history PDF:', err);
    res.status(500).send('Failed to generate event history report.');
  }
});

module.exports = router;
--------------------------------------------------------------------------

const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { getEventData } = require('../utils/reportService');

router.get('/report/download/events/pdf', async (req, res) => {
  try {
    const data = await getEventData();

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Disposition', 'attachment; filename=event_history.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(18).fillColor('#333').text('Event History Report', { align: 'center' }).moveDown(1.5);

    const startX = doc.page.margins.left;
    const colWidths = {
      index: 25,
      event: 110,
      location: 120,
      created: 70,
      urgency: 60,
      skills: 100,
      volunteers: 130,
    };

    // Table header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('#', startX, tableTop, { width: colWidths.index });
    doc.text('Event Name', startX + colWidths.index, tableTop, { width: colWidths.event });
    doc.text('Location', startX + colWidths.index + colWidths.event, tableTop, { width: colWidths.location });
    doc.text('Date', startX + colWidths.index + colWidths.event + colWidths.location, tableTop, { width: colWidths.created });
    doc.text('Urgency', startX + colWidths.index + colWidths.event + colWidths.location + colWidths.created, tableTop, { width: colWidths.urgency });
    doc.text('Skills', startX + colWidths.index + colWidths.event + colWidths.location + colWidths.created + colWidths.urgency, tableTop, { width: colWidths.skills });
    doc.text('Volunteers', startX + colWidths.index + colWidths.event + colWidths.location + colWidths.created + colWidths.urgency + colWidths.skills, tableTop, { width: colWidths.volunteers });

    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(9);

    let y = doc.y;
    const urgencyLabels = { '1': 'Low', '2': 'Medium', '3': 'High', '4': 'Critical' };

    data.forEach((event, index) => {
      const availabilityDate = Array.isArray(event.availability) && event.availability.length
        ? new Date(event.availability[0]).toLocaleDateString()
        : 'N/A';
      const addressLine = `${event.address}${event.address2 ? ', ' + event.address2 : ''}`;
      const location = `${addressLine}, ${event.city}, ${event.state} ${event.zip}`;
      const skills = Array.isArray(event.requiredSkills) && event.requiredSkills.length
        ? event.requiredSkills.join(', ')
        : 'N/A';

    const volunteers = event.matchedVolunteers?.length
        ? event.matchedVolunteers.map(v => {
            const matchedSkills = Array.isArray(v.matchedSkills) && v.matchedSkills.length
                ? v.matchedSkills.join(', ')
                 : 'N/A';
            return `${v.volunteerName} (Skills: ${matchedSkills})`;
        }).join(', ')
        : 'None';

    const urgency = urgencyLabels[event.urgency] || event.urgency || 'N/A';

      if (y > 750) {
        doc.addPage();
        y = doc.y;
      }

      doc.text(`${index + 1}`, startX, y, { width: colWidths.index });
      doc.text(event.eventname || 'Untitled', startX + colWidths.index, y, { width: colWidths.event });
      doc.text(location, startX + colWidths.index + colWidths.event, y, { width: colWidths.location });
      doc.text(availabilityDate, startX + colWidths.index + colWidths.event + colWidths.location, y, { width: colWidths.created });
      doc.text(urgency, startX + colWidths.index + colWidths.event + colWidths.location + colWidths.created, y, { width: colWidths.urgency });
      doc.text(skills, startX + colWidths.index + colWidths.event + colWidths.location + colWidths.created + colWidths.urgency, y, { width: colWidths.skills });
      doc.text(volunteers, startX + colWidths.index + colWidths.event + colWidths.location + colWidths.created + colWidths.urgency + colWidths.skills, y, { width: colWidths.volunteers });

      y += 30;
    });

    doc.end();
  } catch (err) {
    console.error('Error generating event history PDF:', err);
    res.status(500).send('Failed to generate event history report.');
  }
});

module.exports = router;
*/
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
