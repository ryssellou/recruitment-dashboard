import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extract text content from a PDF file
 */
export async function extractFromPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text,
      pages: data.numpages,
      info: data.info
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract PDF content: ${error.message}`);
  }
}

/**
 * Extract text content from a DOCX file
 */
export async function extractFromDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value,
      messages: result.messages
    };
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract DOCX content: ${error.message}`);
  }
}

/**
 * Extract text from a file based on its MIME type
 */
export async function extractText(buffer, mimeType, fileName) {
  // Determine file type from MIME type or extension
  const isPdf = mimeType === 'application/pdf' ||
    fileName?.toLowerCase().endsWith('.pdf');

  const isDocx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName?.toLowerCase().endsWith('.docx');

  const isDoc = mimeType === 'application/msword' ||
    fileName?.toLowerCase().endsWith('.doc');

  if (isPdf) {
    const result = await extractFromPdf(buffer);
    return result.text;
  }

  if (isDocx) {
    const result = await extractFromDocx(buffer);
    return result.text;
  }

  if (isDoc) {
    // Mammoth can sometimes handle .doc files
    try {
      const result = await extractFromDocx(buffer);
      return result.text;
    } catch {
      throw new Error('Legacy .doc files are not fully supported. Please convert to .docx or .pdf');
    }
  }

  // Try as plain text
  if (mimeType?.startsWith('text/')) {
    return buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file type: ${mimeType || fileName}`);
}

export default { extractFromPdf, extractFromDocx, extractText };
