import React, { useState } from 'react';
import SchedulerIdentity from './SchedulerIdentity';
import RecipientDetails from './RecipientDetails';
import DonationDetails from './DonationDetails';
import { nip19 } from 'nostr-tools';

const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://nos.lol",
  "wss://relay.nostr.band",
  "wss://nostr.wine",
  "wss://purplepag.es",
  "wss://relay.snort.social"
];

function App() {
  // --- State ---
  const [schedulerSk, setSchedulerSk] = useState<Uint8Array | null>(null);
  const [schedulerNsec, setSchedulerNsec] = useState<string | null>(null);
  const [schedulerPk, setSchedulerPk] = useState<string | null>(null);
  const [recipientPubkey, setRecipientPubkey] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [scheduleDisabled, setScheduleDisabled] = useState(false);
  const [scheduleAttempts, setScheduleAttempts] = useState<number[]>([]);

  // --- Handlers for subcomponents to lift state up ---
  function handleIdentityChanged(sk: Uint8Array, nsec: string, pk: string) {
    setSchedulerSk(sk);
    setSchedulerNsec(nsec);
    setSchedulerPk(pk);
    addLog("🔑 Scheduler keys set/changed");
  }

  function handleRecipient(pubkey: string) {
    setRecipientPubkey(pubkey);
    addLog("🎉 Recipient validated: " + pubkey);
  }

  function addLog(msg: string) {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-50));
  }

  // --- Central validation helpers ---
  function isValidHexKey(key: string) {
    return /^[0-9A-Fa-f]{64}$/.test(key);
  }
  function isValidNpub(key: string) {
    return key.startsWith('npub1') && key.length === 63;
  }

  // --- Scheduling logic with validation ---
  async function handleSchedule(token: string, delayMinutes: number) {
    const now = Date.now();
    const attempts = scheduleAttempts.filter(t => now - t < 10 * 60 * 1000);
    if (attempts.length >= 5) {
      addLog("Rate limit: Too many schedules from this browser in 10 minutes.");
      return;
    }
    setScheduleAttempts([...attempts, now]);

    // Key validation: scheduler and recipient must be present
    if (!schedulerPk || !recipientPubkey) {
      addLog("Scheduler or recipient pubkey missing.");
      return;
    }

    // No self-donations
    if (schedulerPk === recipientPubkey) {
      addLog("You cannot send a donation to yourself.");
      return;
    }

    // Validate both are 64-char hex keys or valid npub1
    if (!isValidHexKey(schedulerPk) && !isValidNpub(schedulerPk)) {
      addLog("Invalid scheduler pubkey.");
      return;
    }
    if (!isValidHexKey(recipientPubkey) && !isValidNpub(recipientPubkey)) {
      addLog("Invalid recipient pubkey.");
      return;
    }

    setScheduleDisabled(true);

    // Proceed with the rest of your scheduling code
    // For demo, just log success
    addLog("Scheduling request accepted (passed all validations).");
    // ... Insert your existing scheduling logic here ...
    setTimeout(() => setScheduleDisabled(false), 3000); // Simulate operation
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <SchedulerIdentity
          onIdentityChanged={handleIdentityChanged}
        />
        <RecipientDetails
          onRecipientValid={handleRecipient}
        />
        <DonationDetails
          onReadyToSchedule={handleSchedule}
          scheduleDisabled={scheduleDisabled}
        />
        <div className="mt-6 p-4 bg-black text-white text-xs rounded-lg h-40 overflow-y-auto font-mono">
          <div className="font-bold mb-1 text-gray-300">Log:</div>
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}

export default App;
