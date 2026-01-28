import { useState } from 'react';
import {
  DocumentArrowDownIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { analysis as analysisApi } from '../../services/api';

export default function CVAnalysis({ candidate, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { cv_file_id, cvUrls, cv_analysis, cv_analysis_status } = candidate;

  const triggerAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      await analysisApi.trigger(candidate.id);
      // Poll for completion
      const checkStatus = async () => {
        const res = await analysisApi.get(candidate.id);
        if (res.data.status === 'completed' || res.data.status === 'failed') {
          onUpdate?.();
          setLoading(false);
        } else {
          setTimeout(checkStatus, 2000);
        }
      };
      setTimeout(checkStatus, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start analysis');
      setLoading(false);
    }
  };

  if (!cv_file_id) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
        <DocumentArrowDownIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>No CV uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* CV Download */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <span className="text-sm text-gray-600">CV Document</span>
        <div className="flex space-x-2">
          {cvUrls?.preview && (
            <a
              href={cvUrls.preview}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Preview
            </a>
          )}
          {cvUrls?.download && (
            <a
              href={cvUrls.download}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              Download
            </a>
          )}
        </div>
      </div>

      {/* Analysis Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <SparklesIcon className="h-4 w-4 mr-1 text-purple-500" />
            AI Analysis
          </h4>
          {cv_analysis_status !== 'analyzing' && !loading && (
            <button
              onClick={triggerAnalysis}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-800"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              {cv_analysis_status === 'completed' ? 'Re-analyze' : 'Analyze CV'}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm mb-4">
            {error}
          </div>
        )}

        {(loading || cv_analysis_status === 'analyzing') && (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
            Analyzing CV...
          </div>
        )}

        {cv_analysis_status === 'completed' && cv_analysis && (
          <div className="space-y-4 text-sm">
            {/* Skills */}
            {cv_analysis.skills?.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Key Skills</h5>
                <div className="flex flex-wrap gap-1">
                  {cv_analysis.skills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {cv_analysis.experienceSummary && (
              <div>
                <h5 className="font-medium text-gray-700 mb-1">Experience</h5>
                <p className="text-gray-600">{cv_analysis.experienceSummary}</p>
                {cv_analysis.yearsOfExperience && (
                  <p className="text-gray-500 mt-1">~{cv_analysis.yearsOfExperience} years</p>
                )}
              </div>
            )}

            {/* Education */}
            {cv_analysis.education?.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-1">Education</h5>
                <ul className="list-disc list-inside text-gray-600">
                  {cv_analysis.education.map((edu, i) => (
                    <li key={i}>{edu}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {cv_analysis.strengths?.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-1 flex items-center">
                  <CheckBadgeIcon className="h-4 w-4 mr-1 text-green-500" />
                  Strengths
                </h5>
                <ul className="list-disc list-inside text-gray-600">
                  {cv_analysis.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {cv_analysis.concerns?.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-1 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-yellow-500" />
                  Areas to Explore
                </h5>
                <ul className="list-disc list-inside text-gray-600">
                  {cv_analysis.concerns.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overall Fit */}
            {cv_analysis.overallFit && (
              <div className="bg-gray-50 rounded p-3 mt-3">
                <h5 className="font-medium text-gray-700 mb-1">Overall Assessment</h5>
                <p className="text-gray-600">{cv_analysis.overallFit}</p>
              </div>
            )}
          </div>
        )}

        {cv_analysis_status === 'pending' && !loading && (
          <p className="text-gray-500 text-center py-4">
            Click "Analyze CV" to extract key information using AI
          </p>
        )}

        {cv_analysis_status === 'failed' && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
            Analysis failed. {cv_analysis?.error || 'Please try again.'}
          </div>
        )}
      </div>
    </div>
  );
}
