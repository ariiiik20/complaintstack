import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './helpers';

/**
 * Export Complaints list to formatted CSV
 * @param {Array} complaints - List of complaint objects
 * @param {String} fileName - Name of the output CSV file
 * @param {Object} dateRange - Optional { startDate, endDate } filter
 * @returns {Boolean} success status
 */
export const exportToCSV = (complaints = [], fileName = 'complaints_report.csv', dateRange = {}) => {
  try {
    let dataToExport = [...(complaints || [])];

    if (dateRange?.startDate) {
      const start = new Date(dateRange.startDate);
      start.setHours(0, 0, 0, 0);
      dataToExport = dataToExport.filter((c) => new Date(c.createdAt) >= start);
    }
    if (dateRange?.endDate) {
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      dataToExport = dataToExport.filter((c) => new Date(c.createdAt) <= end);
    }

    if (!dataToExport || dataToExport.length === 0) {
      return false;
    }

    const headers = [
      'Ticket ID',
      'Title',
      'Category',
      'Priority',
      'Status',
      'Creator Name',
      'Creator Email',
      'Assigned Agent Name',
      'Created Date',
    ];

    const escapeCSVField = (field) => {
      if (field === null || field === undefined) return '""';
      const str = String(field).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = dataToExport.map((c) => [
      escapeCSVField(c._id),
      escapeCSVField(c.title),
      escapeCSVField(c.category),
      escapeCSVField(c.priority),
      escapeCSVField(c.status),
      escapeCSVField(c.user?.name || c.creator?.name || 'N/A'),
      escapeCSVField(c.user?.email || c.creator?.email || 'N/A'),
      escapeCSVField(c.assignedAgent?.name || 'Unassigned'),
      escapeCSVField(formatDate(c.createdAt)),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Error exporting CSV:', err);
    return false;
  }
};

/**
 * Export Complaints audit report to branded PDF document
 * @param {Array} complaints - Filtered list of complaints
 * @param {Object} summaryStats - Summary analytics metrics (total, pending, resolved, etc.)
 * @param {Object} options - Optional { startDate, endDate, fileName }
 * @returns {Boolean} success status
 */
export const exportToPDF = (
  complaints = [],
  summaryStats = {},
  options = {}
) => {
  try {
    const { startDate, endDate, fileName } = typeof options === 'string' ? { fileName: options } : options;
    const pdfFileName = fileName || `complaints_audit_report_${Date.now()}.pdf`;

    let dataToExport = [...(complaints || [])];

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      dataToExport = dataToExport.filter((c) => new Date(c.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dataToExport = dataToExport.filter((c) => new Date(c.createdAt) <= end);
    }

    if (!dataToExport || dataToExport.length === 0) {
      return false;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Banner
    doc.setFillColor(15, 23, 42); // Slate-900 #0F172A
    doc.rect(0, 0, pageWidth, 80, 'F');

    // Title Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Complaint Management System - Audit Report', 40, 38);

    // Subtitle & Date range
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    
    let dateRangeText = 'All Time Records';
    if (startDate && endDate) {
      dateRangeText = `Filter: ${startDate} to ${endDate}`;
    } else if (startDate) {
      dateRangeText = `Filter: From ${startDate}`;
    } else if (endDate) {
      dateRangeText = `Filter: Until ${endDate}`;
    }
    doc.text(dateRangeText, 40, 58);

    // Generated Timestamp (Right aligned)
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.text(`Generated: ${reportDate}`, pageWidth - 40, 58, { align: 'right' });

    // Summary Metrics Section
    let startY = 105;

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('System Summary Overview', 40, startY);

    startY += 12;

    // Summary Metrics Box
    const total = summaryStats.totalComplaints || dataToExport.length;
    const pending = summaryStats.statusBreakdown?.Pending || dataToExport.filter((c) => c.status === 'Pending').length;
    const inProgress = summaryStats.statusBreakdown?.['In Progress'] || dataToExport.filter((c) => c.status === 'In Progress').length;
    const resolved = summaryStats.statusBreakdown?.Resolved || dataToExport.filter((c) => c.status === 'Resolved').length;
    const critical = dataToExport.filter((c) => c.priority === 'Critical' || c.priority === 'High').length;

    autoTable(doc, {
      startY,
      head: [['Total Complaints', 'Pending', 'In Progress', 'Resolved', 'Critical / High']],
      body: [[total.toString(), pending.toString(), inProgress.toString(), resolved.toString(), critical.toString()]],
      theme: 'grid',
      headStyles: {
        fillColor: [99, 102, 241], // Indigo-600 #6366F1
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9,
      },
      bodyStyles: {
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10,
      },
      margin: { left: 40, right: 40 },
    });

    // Table of Filtered Complaints
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 25 : startY + 50;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Detailed Complaints List (${dataToExport.length} records)`, 40, finalY);

    const tableRows = dataToExport.map((c) => [
      c._id?.substring(c._id.length - 8) || 'N/A',
      c.title.length > 26 ? `${c.title.substring(0, 26)}...` : c.title,
      c.category || 'N/A',
      c.priority || 'Medium',
      c.status || 'Pending',
      c.user?.name || c.creator?.name || 'N/A',
      formatDate(c.createdAt),
    ]);

    autoTable(doc, {
      startY: finalY + 10,
      head: [['ID', 'Title', 'Category', 'Priority', 'Status', 'Assigned To', 'Date']],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 41, 59], // Slate-800 #1E293B
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 130 },
        2: { cellWidth: 65 },
        3: { cellWidth: 55 },
        4: { cellWidth: 65 },
        5: { cellWidth: 80 },
        6: { cellWidth: 65 },
      },
      margin: { left: 40, right: 40 },
    });

    // Save PDF document
    doc.save(pdfFileName.endsWith('.pdf') ? pdfFileName : `${pdfFileName}.pdf`);
    return true;
  } catch (err) {
    console.error('Error exporting PDF:', err);
    return false;
  }
};
