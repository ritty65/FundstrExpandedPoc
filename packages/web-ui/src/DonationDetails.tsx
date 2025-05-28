import React, { useState } from 'react';
import SchedulerIdentity from './SchedulerIdentity';
import RecipientDetails from './RecipientDetails';
import DonationDetails from './DonationDetails';

function App() {
  const [recipientPubkey, setRecipientPubkey] = useState<string | null>(null);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <SchedulerIdentity />
        <RecipientDetails onRecipientValid={setRecipientPubkey} />
        <DonationDetails />
      </div>
    </div>
  );
}

export default App;
