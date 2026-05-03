"use client";

import { X, AlertCircle, TrendingUp, TrendingDown, Minus, FileText } from "lucide-react";

interface AIReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  report: any;
  title?: string;
}

export function AIReportDialog({ isOpen, onClose, report, title = "Medical AI Report" }: AIReportDialogProps) {
  if (!isOpen || !report) return null;

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600 dark:text-red-400";
    if (score >= 50) return "text-orange-600 dark:text-orange-400";
    if (score >= 30) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 80) return "bg-red-50 dark:bg-red-950/20";
    if (score >= 50) return "bg-orange-50 dark:bg-orange-950/20";
    if (score >= 30) return "bg-yellow-50 dark:bg-yellow-950/20";
    return "bg-green-50 dark:bg-green-950/20";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingDown className="text-green-600 dark:text-green-400" size={20} />;
    if (trend === "declining") return <TrendingUp className="text-red-600 dark:text-red-400" size={20} />;
    return <Minus className="text-gray-600 dark:text-gray-400" size={20} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI Generated • {new Date().toLocaleDateString('en-US')} at {new Date().toLocaleTimeString('en-US')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Risk Score */}
          {report.riskScore !== undefined && (
            <div className={`${getRiskBgColor(report.riskScore)} border ${getRiskColor(report.riskScore).replace('text-', 'border-').replace('dark:', '')} rounded-lg p-6`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Score</h3>
                <div className="flex items-center gap-2">
                  {report.trendIndicator && getTrendIcon(report.trendIndicator)}
                  <span className={`text-3xl font-bold ${getRiskColor(report.riskScore)}`}>
                    {Math.round(report.riskScore)}/100
                  </span>
                </div>
              </div>
              {report.riskLevel && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Level: <span className="font-semibold">{report.riskLevel}</span>
                </p>
              )}
            </div>
          )}

          {/* Patient Info */}
          {report.patientInfo && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Patient Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {report.patientInfo.name && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Name:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{report.patientInfo.name}</span>
                  </div>
                )}
                {report.patientInfo.age && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Age:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{report.patientInfo.age} years</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Vitals */}
          {report.currentVitals && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Current Vitals</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(report.currentVitals)
                  .filter(([key, value]) => value !== null && value !== undefined && !(value instanceof Date))
                  .map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Summary */}
          {report.summary && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Analysis Summary</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {report.summary}
              </p>
            </div>
          )}

          {/* Concerns */}
          {report.concerns && report.concerns.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertCircle className="text-orange-600 dark:text-orange-400" size={20} />
                Points of Attention
              </h3>
              <ul className="space-y-2">
                {report.concerns.map((concern: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                    <span>{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {report.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Report */}
          {report.detailedReport && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Detailed Report</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {report.detailedReport}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
