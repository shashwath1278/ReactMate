import React from 'react';
import { useStockfish } from './StockfishEngine';

const EvaluationInfo = () => {
  const { evaluation } = useStockfish();

  return (
    <div className="evaluation-bubble">
      {evaluation || 'Analyzing position...'}
    </div>
  );
};

export default EvaluationInfo;
