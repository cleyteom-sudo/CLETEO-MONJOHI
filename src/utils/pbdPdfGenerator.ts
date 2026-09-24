import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ClassGroup, Student, UserProfile } from '../types';

interface PbdPdfOptions {
  currentClass: ClassGroup;
  students: Student[];
  teacherProfile: {
    name: string;
    email: string;
    school: string;
    guruBesarName?: string;
  };
  guruBesarName?: string;
}

export function generatePbdPdf({ currentClass, students, teacherProfile, guruBesarName: customGbName }: PbdPdfOptions): {
  success: boolean;
  filename: string;
} {
  try {
    // 1. Filter students for this class or fallback to all if class has no matches
    let classStudents = students.filter(
      (s) => s.className?.trim().toLowerCase() === currentClass.name?.trim().toLowerCase()
    );
    if (classStudents.length === 0 && students.length > 0) {
      classStudents = students;
    }

    // 2. Compute TP counts
    const tpCounts: Record<string, number> = {
      TP1: 0,
      TP2: 0,
      TP3: 0,
      TP4: 0,
      TP5: 0,
      TP6: 0,
    };

    classStudents.forEach((s) => {
      const tp = (s.overallTP || 'TP3').toUpperCase();
      if (tpCounts[tp] !== undefined) {
        tpCounts[tp]++;
      } else {
        tpCounts['TP3']++;
      }
    });

    const totalPupils = classStudents.length;
    const mtmCount =
      (tpCounts['TP3'] || 0) +
      (tpCounts['TP4'] || 0) +
      (tpCounts['TP5'] || 0) +
      (tpCounts['TP6'] || 0);
    const mtmPercentage = totalPupils > 0 ? ((mtmCount / totalPupils) * 100).toFixed(1) : '0';

    // 3. Create Landscape A4 Document (297 x 210 mm)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Top Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 24, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('KEMENTERIAN PENDIDIKAN MALAYSIA • BAHAGIAN PEMBANGUNAN KURIKULUM', 14, 8);

    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('BORANG PELAPORAN PENTAKSIRAN BILIK DARJAH (PBD) - BAHASA INGGERIS', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(56, 189, 248); // sky-400
    doc.text('FORMAT STANDARD PENETAPAN TAHAP PENGUASAAN (TP) • SELARAS DSKP CEFR', 14, 20);

    // School & Class Metadata Card
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.roundedRect(14, 28, pageWidth - 28, 22, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105); // slate-600

    // Column 1
    doc.setFont('helvetica', 'bold');
    doc.text('SEKOLAH:', 18, 34);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(teacherProfile.school || 'SK Seri Bintang Bestari', 38, 34);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('GURU MP:', 18, 40);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(teacherProfile.name || 'Guru Bahasa Inggeris', 38, 40);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('E-MEL / ID:', 18, 46);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(teacherProfile.email || 'g-moe@moe-dl.edu.my', 38, 46);

    // Column 2
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('KELAS:', 120, 34);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${currentClass.name} (Tahun ${currentClass.year})`, 135, 34);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('SESI:', 120, 40);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(currentClass.academicYear || '2026/2027', 135, 40);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('ENROLMEN:', 120, 46);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${totalPupils} Murid`, 140, 46);

    // Column 3 - TP summary pill in metadata
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('STATUS MTM (TP3-TP6):', 200, 34);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52); // green-800
    doc.text(`${mtmCount} / ${totalPupils} (${mtmPercentage}%)`, 245, 34);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('TARIKH CETAKAN:', 200, 40);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(new Date().toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' }), 245, 40);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('TABURAN TP KELAS:', 200, 46);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`TP1:${tpCounts.TP1} | TP2:${tpCounts.TP2} | TP3:${tpCounts.TP3} | TP4:${tpCounts.TP4} | TP5:${tpCounts.TP5} | TP6:${tpCounts.TP6}`, 235, 46);

    // 4. Generate Student Table using autoTable
    const tableHeaders = [
      'Bil',
      'Nama Penuh Murid',
      'ID DELIMa Murid',
      'Mendengar\n(Listening)',
      'Bertutur\n(Speaking)',
      'Membaca\n(Reading)',
      'Menulis\n(Writing)',
      'Tahap\nKeseluruhan',
      'Pengesahan\nGuru',
      'Catatan Intervensi / Pencapaian Murid',
    ];

    const tableRows = classStudents.map((std, idx) => {
      const isValidated = std.readingValidated && std.writingValidated && std.speakingValidated;
      const statusText = isValidated ? 'Disahkan' : 'Dalam Semakan';
      const intervention = std.interventionSkill
        ? `Perlu Bimbingan: ${std.interventionSkill}`
        : 'Mencapai Standard Kandungan DSKP';

      return [
        (idx + 1).toString(),
        std.name,
        std.email,
        std.listeningTP || 'TP3',
        std.speakingTP || 'TP3',
        std.readingTP || 'TP3',
        std.writingTP || 'TP3',
        std.overallTP || 'TP3',
        statusText,
        intervention,
      ];
    });

    autoTable(doc, {
      startY: 53,
      head: [tableHeaders],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, // Bil
        1: { cellWidth: 50, fontStyle: 'bold' }, // Nama
        2: { cellWidth: 42, fontSize: 6.5 }, // Email
        3: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }, // Listening
        4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }, // Speaking
        5: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }, // Reading
        6: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }, // Writing
        7: { cellWidth: 22, halign: 'center', fontStyle: 'bold', fillColor: [241, 245, 249] }, // Overall TP
        8: { cellWidth: 20, halign: 'center', fontSize: 6.5 }, // Status
        9: { cellWidth: 'auto', fontSize: 6.5 }, // Notes
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        overflow: 'linebreak',
        lineColor: [203, 213, 225],
        lineWidth: 0.2,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      didParseCell: (data) => {
        // Highlight high TP and low TP cells
        if (data.section === 'body' && data.column.index === 7) {
          const val = String(data.cell.raw);
          if (val === 'TP5' || val === 'TP6') {
            data.cell.styles.textColor = [16, 185, 129]; // emerald
          } else if (val === 'TP1' || val === 'TP2') {
            data.cell.styles.textColor = [239, 68, 68]; // red
          } else {
            data.cell.styles.textColor = [2, 132, 199]; // blue
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    // 5. Signatures Block after table
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 160;

    // Check if we need a new page for signatures
    if (finalY + 32 > pageHeight) {
      doc.addPage();
      renderSignatures(doc, 20, teacherProfile, currentClass, customGbName);
    } else {
      renderSignatures(doc, finalY, teacherProfile, currentClass, customGbName);
    }

    // 6. Page numbers and footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        'English AI SmartTrack • Penjajaran Format Rasmi PBD & idMe Kementerian Pendidikan Malaysia',
        14,
        pageHeight - 6
      );
      doc.text(
        `Halaman ${i} daripada ${totalPages}`,
        pageWidth - 14,
        pageHeight - 6,
        { align: 'right' }
      );
    }

    // 7. Save file with safe sanitised filename
    const cleanClassName = currentClass.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `REKOD_PBD_${cleanClassName}_${dateStr}.pdf`;

    doc.save(filename);

    return {
      success: true,
      filename,
    };
  } catch (error) {
    console.error('Error generating PBD PDF:', error);
    return {
      success: false,
      filename: '',
    };
  }
}

function renderSignatures(
  doc: jsPDF,
  startY: number,
  teacherProfile: { name: string; email: string; school: string; guruBesarName?: string },
  currentClass: ClassGroup,
  customGbName?: string
) {
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  // Left signature: Teacher
  doc.setFont('helvetica', 'bold');
  doc.text('DISEDIAKAN OLEH (GURU MATA PELAJARAN):', 14, startY);
  doc.setDrawColor(71, 85, 105);
  doc.line(14, startY + 16, 85, startY + 16);
  doc.text(teacherProfile.name || 'Guru Bahasa Inggeris', 14, startY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(`Guru Bahasa Inggeris (${currentClass.name})`, 14, startY + 24);
  doc.text(`Tarikh: ${new Date().toLocaleDateString('ms-MY')}`, 14, startY + 28);

  // Right signature: Headmaster / PK Pentadbiran
  const gbName =
    customGbName ||
    teacherProfile.guruBesarName ||
    (typeof window !== 'undefined' ? localStorage.getItem('smarttrack_guru_besar_name') : null) ||
    'Encik Ismail bin Mahmud';

  doc.setFont('helvetica', 'bold');
  doc.text('DISAHKAN OLEH (GURU BESAR / PENGETUA):', 180, startY);
  doc.line(180, startY + 16, 260, startY + 16);
  doc.text(gbName, 180, startY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(`Guru Besar (${teacherProfile.school || 'Kementerian Pendidikan Malaysia'})`, 180, startY + 24);
  doc.text(`Tarikh: ${new Date().toLocaleDateString('ms-MY')}`, 180, startY + 28);
}
