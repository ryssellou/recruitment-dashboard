import { Router } from 'express';
import Candidate from '../models/Candidate.js';
import { downloadFile } from '../services/googleDrive.js';
import { extractText } from '../services/cvExtractor.js';
import { analyzeCv } from '../services/claudeAnalyzer.js';

const router = Router();

/**
 * POST /api/analysis/trigger/:candidateId
 * Trigger CV analysis for a candidate
 */
router.post('/trigger/:candidateId', async (req, res) => {
  const { candidateId } = req.params;

  try {
    // Get candidate
    const candidate = Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Check if CV file exists
    if (!candidate.cv_file_id) {
      return res.status(400).json({ error: 'Candidate has no CV file attached' });
    }

    // Check if already analyzing
    if (candidate.cv_analysis_status === 'analyzing') {
      return res.status(409).json({ error: 'Analysis already in progress' });
    }

    // Update status to analyzing
    Candidate.update(candidateId, { cv_analysis_status: 'analyzing' });

    // Perform analysis asynchronously
    performAnalysis(candidateId, candidate.cv_file_id, candidate.role)
      .catch(error => {
        console.error('Analysis error:', error);
        Candidate.update(candidateId, {
          cv_analysis_status: 'failed',
          cv_analysis: { error: error.message }
        });
      });

    res.json({
      success: true,
      message: 'Analysis started',
      status: 'analyzing'
    });
  } catch (error) {
    console.error('Error triggering analysis:', error);
    res.status(500).json({ error: `Failed to start analysis: ${error.message}` });
  }
});

/**
 * GET /api/analysis/:candidateId
 * Get analysis status and results
 */
router.get('/:candidateId', (req, res) => {
  try {
    const candidate = Candidate.findById(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json({
      status: candidate.cv_analysis_status,
      analysis: candidate.cv_analysis
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

/**
 * Perform CV analysis (internal function)
 */
async function performAnalysis(candidateId, cvFileId, role) {
  console.log(`[Analysis] Starting analysis for candidate ${candidateId}, file: ${cvFileId}`);

  // Download CV from Google Drive
  console.log('[Analysis] Downloading CV from Google Drive...');
  const file = await downloadFile(cvFileId);
  console.log(`[Analysis] Downloaded: ${file.name} (${file.mimeType})`);

  // Extract text content
  console.log('[Analysis] Extracting text...');
  const cvText = await extractText(file.data, file.mimeType, file.name);
  console.log(`[Analysis] Extracted ${cvText?.length || 0} characters`);

  if (!cvText || cvText.trim().length < 50) {
    throw new Error('Could not extract sufficient text from CV');
  }

  // Analyze with Claude
  console.log('[Analysis] Calling Claude API...');
  const analysis = await analyzeCv(cvText, role);
  console.log('[Analysis] Claude analysis complete');

  // Save results
  Candidate.update(candidateId, {
    cv_analysis: analysis,
    cv_analysis_status: 'completed'
  });

  console.log(`[Analysis] Analysis saved for candidate ${candidateId}`);
  return analysis;
}

export default router;
