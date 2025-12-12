
import React from 'react';
import { CallOutcome } from '../types';

interface CallResultProps {
  outcome: CallOutcome;
  className?: string;
}

const CallResult: React.FC<CallResultProps> = ({ outcome, className = '' }) => {
  let styles = 'bg-gray-100 text-gray-700';
  let label = outcome.replace('_', ' ');

  switch (outcome) {
    case CallOutcome.REACHED_CONFIRMED:
      styles = 'bg-green-100 text-green-700 border border-green-200';
      label = 'CONFIRMED';
      break;
    case CallOutcome.REACHED_CANCELLED:
      styles = 'bg-red-100 text-red-700 border border-red-200';
      label = 'CANCELLED';
      break;
    case CallOutcome.BUSY:
      styles = 'bg-orange-100 text-orange-700 border border-orange-200';
      break;
    case CallOutcome.UNREACHABLE:
      styles = 'bg-gray-100 text-gray-700 border border-gray-300';
      break;
    case CallOutcome.SCHEDULED:
      styles = 'bg-blue-100 text-blue-700 border border-blue-200';
      break;
  }

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${styles} ${className}`}>
      {label}
    </span>
  );
};

export default CallResult;
