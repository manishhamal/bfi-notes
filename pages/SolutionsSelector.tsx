import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BankLevelSelector from '../components/BankLevelSelector';
import { Bank, Level } from '../types';

export default function SolutionsSelector() {
  const navigate = useNavigate();
  const { bank } = useParams<{ bank: string }>();

  const handleSelect = (selectedBank: Bank, level: Level) => {
    navigate(`/solutions/${encodeURIComponent(selectedBank)}/${encodeURIComponent(level)}`);
  };

  return (
    <BankLevelSelector 
      title="Solutions Selector Title"
      subtitle="Solutions Selector Sub"
      baseRoute="/solutions"
      onSelect={handleSelect}
      initialBank={bank}
    />
  );
}
