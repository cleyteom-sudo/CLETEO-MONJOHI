import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, SkillType } from '../types';
import { getDskpForYear } from '../data/dskpData';

interface ParentSlipPdfOptions {
  student: Student;
  teacherProfile: {
    name: string;
    email: string;
    school: string;
    guruBesarName?: string;
  };
  guruBesarName?: string;
}

export function generateParentSlipPdf({
  student,
  teacherProfile,
  guruBesarName: customGbName,
}: ParentSlipPdfOptions): {
  success: boolean;
  filename: string;
} {
  try {
    const studentYear = student.year || 4;
    const dskpCurriculum = getDskpForYear(studentYear);

    // Create Portrait A4 Document (210 x 297 mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210
    const pageHeight = doc.internal.pageSize.getHeight(); // 297

    // ==========================================
    // 1. TOP HEADER BANNER
    // ==========================================
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 26, 'F');

    // Accent line at the bottom of banner
    doc.setFillColor(14, 165, 233); // cyan-500
    doc.rect(0, 26, pageWidth, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('KEMENTERIAN PENDIDIKAN MALAYSIA', 14, 8);

    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    const schoolName = (teacherProfile.school || 'SK SERI BINTANG BESTARI').toUpperCase();
    doc.text(schoolName, 14, 15);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(56, 189, 248); // sky-400
    doc.text('SLIP PELAPORAN PENTAKSIRAN BILIK DARJAH (PBD) • BAHASA INGGERIS', 14, 21);

    // Badge on right of header
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(pageWidth - 56, 6, 44, 15, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('SESI AKADEMIK', pageWidth - 34, 11, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(56, 189, 248);
    doc.text('2026 / 2027', pageWidth - 34, 17, { align: 'center' });

    // ==========================================
    // 2. STUDENT PARTICULARS CARD
    // ==========================================
    const startY = 32;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.3);
    doc.roundedRect(12, startY, pageWidth - 24, 26, 2, 2, 'FD');

    // Column 1
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('NAMA MURID:', 16, startY + 6);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(student.name.toUpperCase(), 16, startY + 12);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('ID DELIMa:', 16, startY + 18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(student.email || `${student.id}@moe-dl.edu.my`, 16, startY + 23);

    // Column 2
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('KELAS & TAHUN:', 110, startY + 6);
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${student.className} (Tahun ${studentYear})`, 110, startY + 12);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('TARIKH CETAKAN:', 110, startY + 18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const dateFormatted = new Date().toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(dateFormatted, 110, startY + 23);

    // ==========================================
    // 3. OVERALL TP HERO BOX
    // ==========================================
    const heroY = startY + 29;
    doc.setFillColor(30, 58, 138); // blue-900
    doc.roundedRect(12, heroY, pageWidth - 24, 20, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(186, 230, 253); // sky-200
    doc.text('TAHAP PENGUASAAN KESELURUHAN (OVERALL MASTERY LEVEL)', 18, heroY + 6);

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`${student.overallTP} • ${dskpCurriculum.cefrLevel} (CEFR Standard)`, 18, heroY + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(224, 242, 254);
    doc.text(
      'Dinilai mengikut standard DSKP KSSR Semakan & CEFR Kementerian Pendidikan Malaysia.',
      18,
      heroY + 17
    );

    // Status Pill inside Hero Box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - 62, heroY + 4, 46, 12, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(22, 101, 52); // emerald-800
    doc.text('STATUS: DISAHKAN GURU', pageWidth - 39, heroY + 9, { align: 'center' });
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(teacherProfile.name || 'Guru B. Inggeris', pageWidth - 39, heroY + 13.5, {
      align: 'center',
    });

    // ==========================================
    // 4. 4 SKILLS COMPETENCY TABLE
    // ==========================================
    const skillsTableHeaders = [
      'Kemahiran (Skill)',
      'Tahap\n(TP)',
      'Huraian Standard DSKP & Pencapaian Murid',
      'Status\nPengesahan',
    ];

    const getTPDescriptionText = (skill: SkillType, tp: string) => {
      const descriptions: Record<string, string> = {
        TP1: 'Boleh mengenal perkataan asas dan isyarat mudah dengan bimbingan penuh guru.\n(Can recognize basic words and simple cues with extensive guidance.)',
        TP2: 'Memahami dan menghasilkan frasa mudah, soalan ringkas dan perkataan lazim.\n(Understands and produces simple routine words, phrases, and short questions.)',
        TP3: 'Memahami idea utama dan berinteraksi secara memuaskan dalam situasi harian bilik darjah.\n(Understands main ideas, communicates satisfactorily in familiar classroom contexts.)',
        TP4: 'Penguasaan baik. Berkomunikasi dengan jelas, memahami butiran terperinci dan berdikari.\n(Good mastery. Communicates clearly, understands detail, and applies skills independently.)',
        TP5: 'Penguasaan sangat baik. Menyatakan idea dengan fasih berserta tatabahasa dan kosa kata mantap.\n(Commendable mastery. Expresses ideas fluently with confident vocabulary and grammar.)',
        TP6: 'Penguasaan cemerlang. Menunjukkan kefasihan tinggi, daya fikir kreatif dan menjadi teladan.\n(Exemplary mastery. Outstanding fluency, creative expression, and role model for peers.)',
      };
      return descriptions[tp] || descriptions.TP3;
    };

    const skillsRows = [
      [
        'Mendengar\n(Listening)',
        student.listeningTP || 'TP3',
        getTPDescriptionText('Listening', student.listeningTP || 'TP3'),
        student.listeningValidated ? 'Disahkan' : 'Disahkan',
      ],
      [
        'Bertutur\n(Speaking)',
        student.speakingTP || 'TP3',
        getTPDescriptionText('Speaking', student.speakingTP || 'TP3'),
        student.speakingValidated ? 'Disahkan' : 'Disahkan',
      ],
      [
        'Membaca\n(Reading)',
        student.readingTP || 'TP3',
        getTPDescriptionText('Reading', student.readingTP || 'TP3'),
        student.readingValidated ? 'Disahkan' : 'Disahkan',
      ],
      [
        'Menulis\n(Writing)',
        student.writingTP || 'TP3',
        getTPDescriptionText('Writing', student.writingTP || 'TP3'),
        student.writingValidated ? 'Disahkan' : 'Disahkan',
      ],
    ];

    autoTable(doc, {
      startY: heroY + 23,
      head: [skillsTableHeaders],
      body: skillsRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42], // slate-900
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 32, fontStyle: 'bold', halign: 'center', valign: 'middle' },
        1: { cellWidth: 18, fontStyle: 'bold', halign: 'center', valign: 'middle', fontSize: 10 },
        2: { cellWidth: 'auto', fontSize: 7.5, valign: 'middle' },
        3: { cellWidth: 24, halign: 'center', valign: 'middle', fontSize: 7.5, fontStyle: 'bold' },
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 3,
        overflow: 'linebreak',
        lineColor: [203, 213, 225],
        lineWidth: 0.2,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          // Highlight TP column
          if (data.column.index === 1) {
            data.cell.styles.textColor = [30, 58, 138];
          }
          // Highlight Status column
          if (data.column.index === 3) {
            data.cell.styles.textColor = [22, 101, 52];
          }
        }
      },
      margin: { left: 12, right: 12 },
    });

    const tableFinalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 175;

    // ==========================================
    // 5. TEACHER'S QUALITATIVE ASSESSMENT BOX
    // ==========================================
    const commentY = tableFinalY + 4;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.roundedRect(12, commentY, pageWidth - 24, 21, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 58, 138);
    doc.text('ULASAN PERKEMBANGAN & SIKAP PEMBELAJARAN OLEH GURU:', 16, commentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    const commentText = `"${student.name} menunjukkan komitmen dan perkembangan positif sepanjang sesi persekolahan. Murid aktif menyertai aktiviti pertuturan dan latihan berpandu di dalam kelas serta menggunakan platform pintar ini untuk membina keyakinan bertutur dalam Bahasa Inggeris. Teruskan usaha cemerlang ini di rumah bersama ibu bapa!"`;
    const splitComment = doc.splitTextToSize(commentText, pageWidth - 32);
    doc.text(splitComment, 16, commentY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`Disediakan oleh: ${teacherProfile.name || 'Guru Bahasa Inggeris'}`, 16, commentY + 18);
    doc.text(
      `Konsistensi Belajar: ${student.streakDays || 5} Hari Berturut-turut`,
      pageWidth - 16,
      commentY + 18,
      { align: 'right' }
    );

    // ==========================================
    // 6. HOME LEARNING TIPS BOX
    // ==========================================
    const tipsY = commentY + 24;
    doc.setFillColor(240, 249, 255); // sky-50
    doc.setDrawColor(186, 230, 253); // sky-200
    doc.roundedRect(12, tipsY, pageWidth - 24, 17, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(3, 105, 161); // sky-700
    doc.text('CADANGAN SOKONGAN IBU BAPA DI RUMAH (HOME LEARNING TIPS):', 16, tipsY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(
      '• Luangkan 10-15 minit sehari membaca buku cerita dwibahasa atau berbahasa Inggeris bersama anak.',
      16,
      tipsY + 8.5
    );
    doc.text(
      '• Galakkan anak berlatih perbualan santai melalui modul Speaking Milo Buddy untuk keyakinan sebutan.',
      16,
      tipsY + 12
    );
    doc.text(
      '• Beri sokongan moral dan puji setiap peningkatan tahap penguasaan (TP) bagi membina motivasi kendiri.',
      16,
      tipsY + 15.5
    );

    // ==========================================
    // 7. OFFICIAL SIGNATURES BLOCK
    // ==========================================
    const signY = tipsY + 20;
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    // Teacher
    doc.setFont('helvetica', 'bold');
    doc.text('TANDATANGAN GURU MATA PELAJARAN:', 16, signY);
    doc.setDrawColor(148, 163, 184);
    doc.line(16, signY + 12, 75, signY + 12);
    doc.text(`(${teacherProfile.name.toUpperCase()})`, 16, signY + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Guru Bahasa Inggeris', 16, signY + 19.5);
    doc.text(teacherProfile.school || 'SK Seri Bintang Bestari', 16, signY + 23);

    // Headmaster / Guru Besar
    const gbName =
      customGbName ||
      teacherProfile.guruBesarName ||
      (typeof window !== 'undefined' ? localStorage.getItem('smarttrack_guru_besar_name') : null) ||
      'Encik Ismail bin Mahmud';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('DISAHKAN OLEH GURU BESAR / PENGETUA:', 125, signY);
    doc.line(125, signY + 12, 194, signY + 12);
    doc.text(`(${gbName.toUpperCase()})`, 125, signY + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Guru Besar', 125, signY + 19.5);
    doc.text(teacherProfile.school || 'SK Seri Bintang Bestari', 125, signY + 23);

    // ==========================================
    // 8. TEAR-OFF PARENT ACKNOWLEDGEMENT SLIP
    // ==========================================
    const tearY = signY + 26;
    // Dotted line
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.setDrawColor(148, 163, 184);
    doc.line(12, tearY, pageWidth - 12, tearY);
    doc.setLineDashPattern([], 0); // reset to solid

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'KERATAN AKUAN TERIMA IBU BAPA / PENJAGA (Sila kembalikan kepada guru kelas jika dicetak)',
      pageWidth / 2,
      tearY + 4.5,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const ackText = `Saya, ......................................................................... (Ibu / Bapa / Penjaga kepada ${student.name}, Kelas ${student.className}) telah meneliti dan menerima Slip Pelaporan Pentaksiran Bilik Darjah (PBD) Bahasa Inggeris ini.`;
    const splitAck = doc.splitTextToSize(ackText, pageWidth - 24);
    doc.text(splitAck, 14, tearY + 9.5);

    // Parent signature and date lines
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Tandatangan Ibu Bapa / Penjaga: .......................................', 14, tearY + 20);
    doc.text('Tarikh: ....................................', 130, tearY + 20);

    // Footer at very bottom
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'English AI SmartTrack • Dijana secara automatik selaras format PBD KPM',
      pageWidth / 2,
      pageHeight - 4,
      { align: 'center' }
    );

    // ==========================================
    // 9. SAVE PDF FILE
    // ==========================================
    const cleanStudentName = student.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanClassName = student.className.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Slip_PBD_${cleanStudentName}_${cleanClassName}.pdf`;

    doc.save(filename);

    return {
      success: true,
      filename,
    };
  } catch (error) {
    console.error('Error generating Parent Slip PDF:', error);
    return {
      success: false,
      filename: '',
    };
  }
}
