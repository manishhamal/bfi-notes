import { useNavigate, useParams } from 'react-router-dom';
import BankLevelSelector from '../components/BankLevelSelector';
import { Bank, Level } from '../types';

export default function OldQuestionsSelector() {
  const navigate = useNavigate();
  const { bank } = useParams<{ bank: string }>();

  const handleSelect = (selectedBank: Bank, level: Level) => {
    navigate(`/old-questions/${encodeURIComponent(selectedBank)}/${encodeURIComponent(level)}`);
  };

  return (
    <BankLevelSelector 
      title="Old Questions Selector Title"
      subtitle="Old Questions Selector Sub"
      baseRoute="/old-questions"
      onSelect={handleSelect}
      initialBank={bank}
    />
  );
}
