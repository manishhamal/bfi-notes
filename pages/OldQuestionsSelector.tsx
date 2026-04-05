import React from 'react';
import { useNavigate } from 'react-router-dom';
import BankLevelSelector from '../components/BankLevelSelector';
import { Bank, Level } from '../types';

export default function OldQuestionsSelector() {
  const navigate = useNavigate();

  const handleSelect = (bank: Bank, level: Level) => {
    navigate(`/old-questions/${encodeURIComponent(bank)}/${encodeURIComponent(level)}`);
  };

  return (
    <BankLevelSelector 
      title="Old Questions Collection"
      subtitle="Past paper collections organized by bank and level. Select one to proceed."
      baseRoute="/old-questions"
      onSelect={handleSelect}
    />
  );
}
