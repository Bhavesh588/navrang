// File and Excel export utilities
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const exportsDir = path.join(__dirname, '../exports');

// Create exports directory if it doesn't exist
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

const generateExcelFile = (data, filename, sheetName = 'Sheet1') => {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    const colWidths = [];
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        colWidths.push({ wch: Math.min(20, Math.max(key.length, 10)) });
      });
      worksheet['!cols'] = colWidths;
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    const filepath = path.join(exportsDir, filename);
    XLSX.writeFile(workbook, filepath);
    
    return {
      success: true,
      filepath,
      filename
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const generateMultiSheetExcel = (sheetsData, filename) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    sheetsData.forEach(({ data, sheetName }) => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Set column widths
      const colWidths = [];
      if (data.length > 0) {
        Object.keys(data[0]).forEach(key => {
          colWidths.push({ wch: Math.min(20, Math.max(key.length, 10)) });
        });
        worksheet['!cols'] = colWidths;
      }
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Sheet1');
    });
    
    const filepath = path.join(exportsDir, filename);
    XLSX.writeFile(workbook, filepath);
    
    return {
      success: true,
      filepath,
      filename
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const transformToExcelFormat = (data, columnMapping = {}) => {
  return data.map(item => {
    const row = {};
    Object.entries(columnMapping).forEach(([dbField, excelHeader]) => {
      row[excelHeader] = item[dbField];
    });
    return row;
  });
};

module.exports = {
  generateExcelFile,
  generateMultiSheetExcel,
  transformToExcelFormat,
  exportsDir
};
