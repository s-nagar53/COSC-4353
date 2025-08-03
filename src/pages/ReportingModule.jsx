import React from 'react';
import './Profile.css'; // reuse same styling as other pages
import { useNavigate } from 'react-router-dom';

const downloadButtonStyle = {
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  borderRadius: '6px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  display: 'block',
  margin: '1rem auto', // spacing between buttons
};

function downloadFile(url, filename) {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch(err => {
      console.error('Download failed:', err);
      alert('Something went wrong while downloading the report.');
    });
}

export default function ReportingModule() {
const navigate = useNavigate();
  const handleDownloadPDF = () => {
    fetch('/api/report/download/pdf', {
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'volunteer_report.pdf';
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => {
        console.error('PDF download failed:', err);
        alert('Something went wrong while generating the report.');
      });
  };

  return (
    <div className="page-wrapper profile-scroll">
      <div className="profile-container">
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          Reporting Module
        </h1>
        <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#555' }}>
          Generate and download the latest volunteer report below.
        </p>

        <div
          style={{
            backgroundColor: '#f9f9f9',
            borderRadius: '12px',
            padding: '2rem',
            marginTop: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            color: 'black',
          }}
        >
          <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            Choose the format and report type
          </h3>
            <button
            onClick={() => downloadFile('/api/report/download/events/pdf', 'event_history.pdf')}
            style={downloadButtonStyle}
            >
            Download PDF Report for Event History
            </button>

            <button
            onClick={() => downloadFile('/api/report/download/events/csv', 'event_history.csv')}
            style={downloadButtonStyle}
            >
            Download CSV Report for Event History
            </button>

            <button
            onClick={() => downloadFile('/api/report/download/volunteers/pdf', 'volunteer_history.pdf')}
            style={downloadButtonStyle}
            >
            Download PDF Report for Volunteer History
            </button>

            <button
            onClick={() => downloadFile('/api/report/download/volunteers/csv', 'volunteer_history.csv')}
            style={downloadButtonStyle}
            >
            Download CSV Report for Volunteer History
            </button>

        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button 
            onClick={() => navigate('/admin-dashboard')}
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
