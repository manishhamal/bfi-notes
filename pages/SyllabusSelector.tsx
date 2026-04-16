import React from 'react';
import { useParams } from 'react-router-dom';
import BankLevelSelector from '../components/BankLevelSelector';

export default function SyllabusSelector() {
  const { bank } = useParams<{ bank: string }>();
  return (
    <BankLevelSelector 
      title="Syllabus Selector Title"
      subtitle="Syllabus Selector Sub"
      baseRoute="/syllabus"
      initialBank={bank}
    />
  );
}
