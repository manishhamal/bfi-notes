import React from 'react';
import BankLevelSelector from '../components/BankLevelSelector';

export default function SyllabusSelector() {
  return (
    <BankLevelSelector 
      title="Syllabus Vault"
      subtitle="Select your preferred bank and level to view the official syllabus."
      baseRoute="/syllabus"
    />
  );
}
