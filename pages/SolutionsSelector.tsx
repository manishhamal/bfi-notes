import React from 'react';
import { useNavigate } from 'react-router-dom';
import BankLevelSelector from '../components/BankLevelSelector';
import { Bank, Level } from '../types';

export default function SolutionsSelector() {
  const navigate = useNavigate();

  const handleSelect = (bank: Bank, level: Level) => {
    navigate(`/articles?category=Banking&bank=${encodeURIComponent(bank)}&level=${encodeURIComponent(level)}`);
  };

  return (
    <BankLevelSelector 
      title="Old Question Solutions"
      subtitle="Find solved answers for past exams. Select your bank and level to browse."
      baseRoute="/solutions"
      onSelect={handleSelect}
    />
  );
}
