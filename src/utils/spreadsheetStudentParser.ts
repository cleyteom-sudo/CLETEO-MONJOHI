import * as XLSX from 'xlsx';
import { TPLevel } from '../types';

export interface DetectedStudent {
  name: string;
  email: string;
  year: number;
  className: string;
  originalClassRaw?: string;
  readingTP?: TPLevel;
  writingTP?: TPLevel;
  listeningTP?: TPLevel;
  speakingTP?: TPLevel;
  suggestedBaseline?: TPLevel;
}

export interface DetectedClassInfo {
  className: string;
  year: number;
  studentCount: number;
  isExisting: boolean;
}

export interface ParsedSpreadsheetResult {
  success: boolean;
  fileName: string;
  sheetNames: string[];
  activeSheetName: string;
  totalRowsFound: number;
  students: DetectedStudent[];
  detectedClasses: DetectedClassInfo[];
  primaryDetectedClass: string;
  primaryDetectedYear: number;
  detectedColumns: {
    nameCol: string | null;
    emailCol: string | null;
    yearCol: string | null;
    classCol: string | null;
  };
  warnings: string[];
}

/**
 * Normalizes and extracts year and class name, ensuring year and class are strictly synchronized.
 * E.g.:
 * - classRaw: "3 Inovatif" -> year: 3, className: "3 INOVATIF"
 * - classRaw: "Inovatif", yearRaw: 3 -> year: 3, className: "3 INOVATIF"
 * - classRaw: "3-INOVATIF" -> year: 3, className: "3 INOVATIF"
 * - classRaw: "Inovatif" (no year) -> year from file/sheet/default, className: "3 INOVATIF"
 * - classRaw: "3", yearRaw: "Inovatif" -> year: 3, className: "3 INOVATIF"
 */
export function syncClassAndYear(
  classRaw?: string | number,
  yearRaw?: string | number,
  fallbackYear: number = 3
): { year: number; className: string; rawClass: string; sectionName: string } {
  let rawClass = String(classRaw ?? '').trim();
  let rawYear = String(yearRaw ?? '').trim();

  let detectedYear = 0;
  let section = '';

  // 1. Check if rawYear is a number 1-6
  const yearMatch = rawYear.match(/^([1-6])$/) || rawYear.match(/(?:Tahun|Darjah|Year|T)?\s*([1-6])/i);
  if (yearMatch) {
    detectedYear = parseInt(yearMatch[1], 10);
  }

  // 2. Check if columns are swapped (rawClass is a single digit 1-6, and rawYear has the section name)
  if (!detectedYear && /^[1-6]$/.test(rawClass) && rawYear) {
    detectedYear = parseInt(rawClass, 10);
    rawClass = rawYear;
    rawYear = '';
  }

  // 3. Extract year and section from rawClass if it contains both (e.g. "3 Inovatif", "Tahun 3 Inovatif", "3-INOVATIF")
  if (rawClass) {
    const combinedMatch = rawClass.match(/(?:Tahun|Darjah|Year|Kelas|Class|T)?\s*([1-6])\s*[-_\s:]*\s*([A-Za-z0-9\s]+)/i);
    if (combinedMatch) {
      const yearFromClass = parseInt(combinedMatch[1], 10);
      const pureSection = combinedMatch[2].replace(/^(?:Kelas|Class)\s*[-_:]*\s*/i, '').trim().toUpperCase();
      
      if (!detectedYear) {
        detectedYear = yearFromClass;
      }
      section = pureSection;

      const finalYear = detectedYear || yearFromClass;
      return {
        year: finalYear,
        className: `${finalYear} ${section}`.trim(),
        rawClass,
        sectionName: section,
      };
    }
  }

  // 4. If rawClass is just the section name (e.g. "Inovatif") without number
  if (rawClass) {
    const cleanPure = rawClass.replace(/^(?:Kelas|Class|Tahun|Darjah)\s*[-_:]*\s*/i, '').trim().toUpperCase();
    section = cleanPure;
    const finalYear = detectedYear || fallbackYear;
    return {
      year: finalYear,
      className: `${finalYear} ${cleanPure}`.trim(),
      rawClass,
      sectionName: cleanPure,
    };
  }

  // 5. Fallback if class name is empty
  const finalYear = detectedYear || fallbackYear;
  return {
    year: finalYear,
    className: `${finalYear} INOVATIF`,
    rawClass: '',
    sectionName: 'INOVATIF',
  };
}

/**
 * Extracts class and year clues from file name, worksheet title, or banner text
 * e.g. "SENARAI_MURID_3_INOVATIF.xlsx" -> Year 3, Class "3 INOVATIF"
 */
export function extractClassFromMetadata(text: string): { year?: number; className?: string; sectionName?: string } {
  if (!text) return {};

  // Check for combined pattern e.g. "Tahun 3 Inovatif", "3 Inovatif", "3_Inovatif", "3-Inovatif"
  const match = text.match(/(?:Tahun|Darjah|Year|Kelas|Class)?\s*([1-6])\s*[-_\s:]+([A-Za-z0-9]+)/i);
  if (match) {
    const yr = parseInt(match[1], 10);
    const sec = match[2].trim().toUpperCase();
    return {
      year: yr,
      className: `${yr} ${sec}`,
      sectionName: sec,
    };
  }

  // Check if text has class name e.g. "Inovatif"
  const commonClasses = ['INOVATIF', 'KREATIF', 'DEDIKASI', 'CEMERLANG', 'BESTARI', 'AMANAH', 'BIJAK', 'HARMONI', 'MAJU'];
  for (const cls of commonClasses) {
    if (new RegExp(`\\b${cls}\\b`, 'i').test(text)) {
      const yearCheck = text.match(/([1-6])/);
      const yr = yearCheck ? parseInt(yearCheck[1], 10) : 3;
      return {
        year: yr,
        className: `${yr} ${cls}`,
        sectionName: cls,
      };
    }
  }

  // Check if text only has a year number
  const singleYear = text.match(/(?:Tahun|Darjah|Year)\s*([1-6])/i);
  if (singleYear) {
    const yr = parseInt(singleYear[1], 10);
    return {
      year: yr,
      className: `${yr} INOVATIF`,
      sectionName: 'INOVATIF',
    };
  }

  return {};
}

/**
 * Generates standard MOE DELIMa email format if student has no email in spreadsheet
 */
export function generateDelimaEmail(studentName: string, index: number = 1): string {
  const clean = studentName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('.');

  const randNum = String(index).padStart(4, '0');
  return clean ? `m-${clean}-${randNum}@moe-dl.edu.my` : `m-pupil-${randNum}@moe-dl.edu.my`;
}

/**
 * Validates and normalizes TP Level string
 */
function normalizeTP(val: any): TPLevel {
  if (!val) return 'TP3';
  const str = String(val).toUpperCase().trim();
  if (['TP1', 'TP2', 'TP3', 'TP4', 'TP5', 'TP6'].includes(str)) {
    return str as TPLevel;
  }
  const numMatch = str.match(/([1-6])/);
  if (numMatch) {
    return `TP${numMatch[1]}` as TPLevel;
  }
  return 'TP3';
}

/**
 * Internal parser that takes a 2D raw rows array and extracts students, year, and class
 */
function parseRawRows(
  rawRows: any[][],
  fileName: string,
  sheetName: string,
  existingClasses: { name: string; year: number }[] = []
): ParsedSpreadsheetResult {
  const warnings: string[] = [];

  // Extract hints from filename and sheetName
  const fileHints = extractClassFromMetadata(fileName);
  const sheetHints = extractClassFromMetadata(sheetName);

  let defaultYear = sheetHints.year || fileHints.year || 3;
  let defaultClassName = sheetHints.className || fileHints.className || '3 INOVATIF';

  // Common header patterns (bilingual Malay/English)
  const nameKeywords = ['nama murid', 'nama pelajar', 'nama penuh', 'nama pemohon', 'student name', 'full name', 'nama', 'murid', 'pelajar', 'pupil', 'name'];
  const emailKeywords = ['id delima', 'e-mel delima', 'emel delima', 'akaun delima', 'google id', 'delima id', 'delima email', 'e-mel', 'emel', 'email', 'e-mail', 'mail'];
  const yearKeywords = ['tahun', 'year', 'darjah', 'tingkatan', 'grade', 'level'];
  const classKeywords = ['nama kelas', 'bilik darjah', 'kelas', 'class', 'section'];
  const tpKeywords = ['tp', 'tahap penguasaan', 'baseline', 'band', 'grade', 'pbd'];

  let headerRowIndex = -1;
  let colIndexName = -1;
  let colIndexEmail = -1;
  let colIndexYear = -1;
  let colIndexClass = -1;
  let colIndexTP = -1;

  // First: Scan rows for metadata banners and table header
  const maxScan = Math.min(rawRows.length, 15);
  for (let r = 0; r < maxScan; r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;

    // Check non-empty cell count
    const nonEmptyCells = row.filter((c) => String(c ?? '').trim().length > 0);
    const rowText = row.map((c) => String(c ?? '')).join(' ');

    // If row looks like a title banner (e.g. "SENARAI NAMA MURID TAHUN 3 INOVATIF")
    const bannerHints = extractClassFromMetadata(rowText);
    if (bannerHints.year && !sheetHints.year) defaultYear = bannerHints.year;
    if (bannerHints.className && !sheetHints.className) defaultClassName = bannerHints.className;

    // A real table header must have multiple columns (at least 2 non-empty cells)
    if (nonEmptyCells.length >= 2) {
      let tempName = -1;
      let tempEmail = -1;
      let tempYear = -1;
      let tempClass = -1;
      let tempTP = -1;
      let matchCount = 0;

      for (let c = 0; c < row.length; c++) {
        const cell = String(row[c] || '').toLowerCase().trim();
        if (!cell || cell.length > 50) continue; // Headers are short, not paragraphs

        if (tempName === -1 && nameKeywords.some((k) => cell === k || (cell.includes(k) && !cell.includes('sekolah') && !cell.includes('guru') && !cell.includes('kelas')))) {
          tempName = c;
          matchCount++;
        } else if (tempEmail === -1 && emailKeywords.some((k) => cell === k || cell.includes(k))) {
          // Avoid matching "id" when column is just "bil" or "no id"
          if (!cell.includes('bil') && !cell.includes('no kp') && !cell.includes('kad pengenalan')) {
            tempEmail = c;
            matchCount++;
          }
        } else if (tempClass === -1 && classKeywords.some((k) => cell === k || cell.includes(k))) {
          tempClass = c;
          matchCount++;
        } else if (tempYear === -1 && yearKeywords.some((k) => cell === k || cell.includes(k))) {
          tempYear = c;
          matchCount++;
        } else if (tempTP === -1 && tpKeywords.some((k) => cell === k || cell.includes(k))) {
          tempTP = c;
        }
      }

      // If we found Name and at least one other column, or Name clearly present in a multi-col row
      if (tempName !== -1 && matchCount >= 1) {
        headerRowIndex = r;
        colIndexName = tempName;
        colIndexEmail = tempEmail;
        colIndexYear = tempYear;
        colIndexClass = tempClass;
        colIndexTP = tempTP;
        break;
      }
    }
  }

  // Fallback: If no explicit header row was identified, inspect data rows directly
  if (headerRowIndex === -1) {
    // Check if row 0 or 1 contains names
    for (let r = 0; r < Math.min(rawRows.length, 3); r++) {
      const row = rawRows[r];
      if (!Array.isArray(row)) continue;

      for (let c = 0; c < row.length; c++) {
        const cell = String(row[c] || '').trim();
        // Check for email
        if (colIndexEmail === -1 && cell.includes('@')) {
          colIndexEmail = c;
        }
        // Check for year
        if (colIndexYear === -1 && /^[1-6]$/.test(cell)) {
          colIndexYear = c;
        }
        // Check for class name e.g. "3 INOVATIF" or "INOVATIF"
        if (colIndexClass === -1 && /(?:INOVATIF|KREATIF|DEDIKASI|CEMERLANG|BESTARI|AMANAH|BIJAK)/i.test(cell)) {
          colIndexClass = c;
        }
        // Check for pupil name (2 or more words, letters only, possibly with BIN/BINTI/A/L)
        if (colIndexName === -1 && cell.length >= 4 && !/^\d+$/.test(cell) && !cell.includes('@')) {
          if (/(?:bin|binti|a\/l|a\/p)/i.test(cell) || (cell.split(/\s+/).length >= 2 && /^[A-Za-z\s'\.-]+$/.test(cell))) {
            colIndexName = c;
          }
        }
      }
    }

    // Default column 1 as name if column 0 is just numbers
    if (colIndexName === -1) {
      colIndexName = rawRows[0]?.length > 1 ? 1 : 0;
      warnings.push('Lajur Nama dikesan secara automatik berdasarkan kedudukan teks.');
    }
    headerRowIndex = 0;
  }

  // ==============================================================
  // PARSE DATA ROWS & AUTO-DETECT STUDENTS, YEAR & CLASS
  // ==============================================================
  const students: DetectedStudent[] = [];
  const classMap = new Map<string, { year: number; count: number }>();

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    // Extract Raw Name
    let rawName = colIndexName !== -1 ? String(row[colIndexName] ?? '').trim() : '';

    // If colIndexName yielded an index/number, try adjacent column
    if (/^\d+$/.test(rawName) && row.length > colIndexName + 1) {
      rawName = String(row[colIndexName + 1] ?? '').trim();
    }

    // Clean up leading numbering e.g. "1. Aiman", "01 - Aiman", "1 ) Aiman"
    rawName = rawName.replace(/^(\d+[\.\-\)]\s*)/, '').trim();

    // Skip empty or summary rows
    if (!rawName || rawName.length < 2) continue;
    if (/^(jumlah|total|bilangan|guru|catatan|tarikh|tandatangan|disediakan|disahkan|bil|no)/i.test(rawName)) continue;

    // Extract Raw Email
    let rawEmail = colIndexEmail !== -1 ? String(row[colIndexEmail] ?? '').trim() : '';
    if (!rawEmail || !rawEmail.includes('@')) {
      rawEmail = generateDelimaEmail(rawName, students.length + 1);
    } else {
      rawEmail = rawEmail.toLowerCase();
    }

    // Extract Raw Class & Year
    const rawClassValue = colIndexClass !== -1 ? row[colIndexClass] : '';
    const rawYearValue = colIndexYear !== -1 ? row[colIndexYear] : '';

    // Synchronize Year & Class strictly!
    // e.g. Class "3" Inovatif -> Year: 3, Class: "3 INOVATIF"
    const synced = syncClassAndYear(
      rawClassValue || defaultClassName,
      rawYearValue || defaultYear,
      defaultYear
    );

    // Extract Baseline TP if present
    const baselineTP = colIndexTP !== -1 ? normalizeTP(row[colIndexTP]) : 'TP3';

    const studentObj: DetectedStudent = {
      name: rawName.toUpperCase(),
      email: rawEmail,
      year: synced.year,
      className: synced.className,
      originalClassRaw: synced.rawClass,
      readingTP: baselineTP,
      writingTP: baselineTP,
      listeningTP: baselineTP,
      speakingTP: baselineTP,
      suggestedBaseline: baselineTP,
    };

    students.push(studentObj);

    // Record in class map
    const existingCount = classMap.get(synced.className) || { year: synced.year, count: 0 };
    existingCount.count++;
    classMap.set(synced.className, existingCount);
  }

  // Compile detected classes summary
  const existingClassNamesLower = new Set(
    existingClasses.map((c) => c.name.toLowerCase().trim())
  );

  const detectedClasses: DetectedClassInfo[] = Array.from(classMap.entries()).map(
    ([clsName, info]) => {
      return {
        className: clsName,
        year: info.year,
        studentCount: info.count,
        isExisting: existingClassNamesLower.has(clsName.toLowerCase().trim()),
      };
    }
  );

  detectedClasses.sort((a, b) => b.studentCount - a.studentCount);

  const primaryClass = detectedClasses[0]?.className || defaultClassName || '3 INOVATIF';
  const primaryYear = detectedClasses[0]?.year || defaultYear || 3;

  return {
    success: students.length > 0,
    fileName,
    sheetNames: [sheetName],
    activeSheetName: sheetName,
    totalRowsFound: students.length,
    students,
    detectedClasses,
    primaryDetectedClass: primaryClass,
    primaryDetectedYear: primaryYear,
    detectedColumns: {
      nameCol: colIndexName !== -1 ? String(rawRows[headerRowIndex]?.[colIndexName] || 'Nama') : null,
      emailCol: colIndexEmail !== -1 ? String(rawRows[headerRowIndex]?.[colIndexEmail] || 'E-mel DELIMa') : null,
      yearCol: colIndexYear !== -1 ? String(rawRows[headerRowIndex]?.[colIndexYear] || 'Tahun') : null,
      classCol: colIndexClass !== -1 ? String(rawRows[headerRowIndex]?.[colIndexClass] || 'Kelas') : null,
    },
    warnings,
  };
}

/**
 * Main parser function: Reads File (.xlsx, .xls, .csv), detects header columns,
 * syncs year with class name (e.g. Class "3" Inovatif), and returns clean student list.
 */
export async function parseStudentSpreadsheet(
  file: File,
  existingClasses: { name: string; year: number }[] = []
): Promise<ParsedSpreadsheetResult> {
  const fileName = file.name;

  return new Promise<ParsedSpreadsheetResult>((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          resolve({
            success: false,
            fileName,
            sheetNames: [],
            activeSheetName: '',
            totalRowsFound: 0,
            students: [],
            detectedClasses: [],
            primaryDetectedClass: '3 INOVATIF',
            primaryDetectedYear: 3,
            detectedColumns: { nameCol: null, emailCol: null, yearCol: null, classCol: null },
            warnings: ['Fail spreadsheet kosong atau tiada helaian ditemui.'],
          });
          return;
        }

        // Search through all sheets to find the best sheet with student data
        let bestResult: ParsedSpreadsheetResult | null = null;

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) continue;

          const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            blankrows: false,
            defval: '',
          });

          if (!rawRows || rawRows.length === 0) continue;

          const result = parseRawRows(rawRows, fileName, sheetName, existingClasses);
          result.sheetNames = workbook.SheetNames;

          if (!bestResult || result.students.length > bestResult.students.length) {
            bestResult = result;
          }

          // If this sheet has 3 Inovatif or more than 5 students, it's very likely the target sheet
          if (result.students.length >= 5 || /3\s*inovatif/i.test(sheetName)) {
            break;
          }
        }

        if (bestResult && bestResult.students.length > 0) {
          resolve(bestResult);
        } else {
          resolve({
            success: false,
            fileName,
            sheetNames: workbook.SheetNames,
            activeSheetName: workbook.SheetNames[0] || '',
            totalRowsFound: 0,
            students: [],
            detectedClasses: [],
            primaryDetectedClass: '3 INOVATIF',
            primaryDetectedYear: 3,
            detectedColumns: { nameCol: null, emailCol: null, yearCol: null, classCol: null },
            warnings: ['Tiada data murid ditemui di dalam helaian. Sila pastikan format lajur mengandungi nama murid.'],
          });
        }
      } catch (err: any) {
        console.error('Spreadsheet parse error:', err);
        resolve({
          success: false,
          fileName,
          sheetNames: [],
          activeSheetName: '',
          totalRowsFound: 0,
          students: [],
          detectedClasses: [],
          primaryDetectedClass: '3 INOVATIF',
          primaryDetectedYear: 3,
          detectedColumns: { nameCol: null, emailCol: null, yearCol: null, classCol: null },
          warnings: [`Gagal membaca fail: ${err?.message || 'Format tidak disokong'}`],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        fileName,
        sheetNames: [],
        activeSheetName: '',
        totalRowsFound: 0,
        students: [],
        detectedClasses: [],
        primaryDetectedClass: '3 INOVATIF',
        primaryDetectedYear: 3,
        detectedColumns: { nameCol: null, emailCol: null, yearCol: null, classCol: null },
        warnings: ['Ralat membaca fail daripada peranti.'],
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parses raw text copied and pasted from Excel, CSV, or Google Sheets
 */
export function parseStudentTextTable(
  text: string,
  existingClasses: { name: string; year: number }[] = []
): ParsedSpreadsheetResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const rawRows = lines.map((line) => {
    // Detect delimiter: tab or comma or semicolon
    if (line.includes('\t')) {
      return line.split('\t').map((c) => c.trim());
    }
    if (line.includes(';') && !line.includes(',')) {
      return line.split(';').map((c) => c.trim());
    }
    return line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
  });

  return parseRawRows(rawRows, 'Teks_Ditampal.csv', 'Helaian 1', existingClasses);
}
