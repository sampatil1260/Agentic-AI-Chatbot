import React, { useState } from 'react';
import { Source } from '../types/chat';

interface SourceCardProps {
  sources: Source[];
}

const SourceCard: React.FC<SourceCardProps> = ({ sources }) => {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden text-sm w-full">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-gray-600">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
          <span className="font-medium">{sources.length} Sources</span>
        </div>
        <svg 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      
      {expanded && (
        <div className="p-3 pt-0 border-t border-gray-200">
          <ul className="space-y-2 mt-2">
            {sources.map((source, idx) => (
              <li key={idx} className="bg-white p-2 rounded border border-gray-100 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-800">{source.productName || 'Unknown Product'}</span>
                  {source.score && (
                    <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-mono">
                      Score: {source.score.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 flex gap-2">
                  {source.productCategory && <span>{source.productCategory}</span>}
                  {source.productSubCategory && <span>• {source.productSubCategory}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SourceCard;
