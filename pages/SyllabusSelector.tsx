import React from 'react';
import { useParams } from 'react-router-dom';
import BankLevelSelector from '../components/BankLevelSelector';

export default function SyllabusSelector() {
  const { bank } = useParams<{ bank: string }>();
  return (
    <BankLevelSelector 
      title="Syllabus Vault"
      subtitle="Select your preferred bank and level to view the official syllabus."
      baseRoute="/syllabus"
      initialBank={bank}
    />
  );
}
