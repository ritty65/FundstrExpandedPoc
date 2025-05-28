import React, { useState } from 'react';
import SchedulerIdentity from './SchedulerIdentity';
import RecipientDetails from './RecipientDetails';

function App() {
  // This state will store the validated recipient pubkey
  const [recipientPubkey, setRecipientPubkey] = useState<string | null>(null);

  return (
    <div>
      <SchedulerIdentity />
      <RecipientDetails onRecipientValid={setRecipientPubkey} />
      {/* Other sections can use recipientPubkey as needed */}
    </div>
  );
}

export default App;
