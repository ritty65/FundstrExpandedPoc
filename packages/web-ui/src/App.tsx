import React, { useState } from 'react';
import SchedulerIdentity from './SchedulerIdentity';
import RecipientDetails from './RecipientDetails';
import DonationDetails from './DonationDetails';

function AppHeader() {
  const [dark, setDark] = React.useState(() => {
    const fromStorage = localStorage.getItem('theme-dark');
    return fromStorage ? fromStorage === "true" : false;
  });

  React.useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme-dark', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme-dark', 'false');
    }
  }, [dark]);

  return (
    <div style={{ width: '100%' }}>
      <button
        className="theme-toggle-btn"
        onClick={() => setDark((d) => !d)}
        title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {dark ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>
      <div className="app-header">Fundstr Scheduler</div>
    </div>
  );
}

function App() {
  const [schedulerSk, setSchedulerSk] = useState<Uint8Array | null>(null);
  const [schedulerNsec, setSchedulerNsec] = useState<string | null>(null);
  const [schedulerPk, setSchedulerPk] = useState<string | null>(null);
  const [recipientPubkey, setRecipientPubkey] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [scheduleDisabled, setScheduleDisabled] = useState(false);
  const [scheduleAttempts, setScheduleAttempts] = useState<number[]>([]);

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

  function isValidHexKey(key: string) {
    return /^[0-9A-Fa-f]{64}$/.test(key);
  }
  function isValidNpub(key: string) {
    return key.startsWith('npub1') && key.length === 63;
  }

  async function handleSchedule(token: string, delayMinutes: number) {
    const now = Date.now();
    const attempts = scheduleAttempts.filter(t => now - t < 10 * 60 * 1000);
    if (attempts.length >= 5) {
      addLog("Rate limit: Too many schedules from this browser in 10 minutes.");
      return;
    }
    setScheduleAttempts([...attempts, now]);

    if (!schedulerPk || !recipientPubkey) {
      addLog("Scheduler or recipient pubkey missing.");
      return;
    }
    if (schedulerPk === recipientPubkey) {
      addLog("You cannot send a donation to yourself.");
      return;
    }
    if (!isValidHexKey(schedulerPk) && !isValidNpub(schedulerPk)) {
      addLog("Invalid scheduler pubkey.");
      return;
    }
    if (!isValidHexKey(recipientPubkey) && !isValidNpub(recipientPubkey)) {
      addLog("Invalid recipient pubkey.");
      return;
    }

    setScheduleDisabled(true);

    addLog("Scheduling request accepted (passed all validations).");
    // ... Insert your real scheduling logic here ...
    setTimeout(() => setScheduleDisabled(false), 3000);
  }

  return (
    <div className="app-container">
      <div className="column-center">
        <AppHeader />
        <SchedulerIdentity onIdentityChanged={handleIdentityChanged} />
        <RecipientDetails onRecipientValid={handleRecipient} />
        <DonationDetails onReadyToSchedule={handleSchedule} scheduleDisabled={scheduleDisabled} />
        <div className="card log-box" style={{marginTop: "0.2rem"}}>
          <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: "#b6bccd" }}>Log:</div>
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}

export default App;
