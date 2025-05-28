import React, { useState, useRef } from 'react';
import SchedulerIdentity from './SchedulerIdentity';
import RecipientDetails from './RecipientDetails';
import DonationDetails from './DonationDetails';
import {
  nip19,
  SimplePool,
  generateSecretKey,
  getPublicKey,
  nip04,
  finalizeEvent, // <- Correct export!
  getEventHash,
} from 'nostr-tools';

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

  // --- Scheduling logic ---
  async function handleSchedule(token: string, delayMinutes: number) {
    if (!schedulerSk || !schedulerPk || !schedulerNsec) {
      addLog("❌ Scheduler keys not set.");
      return;
    }
    if (!recipientPubkey) {
      addLog("❌ Recipient not validated.");
      return;
    }
    if (!token.trim()) {
      addLog("❌ Cashu token missing.");
      return;
    }
    // Prompt for community scheduler npub
    const svcNpub = prompt("Paste the Community Scheduler’s npub (starts with npub1)");
    if (!svcNpub) {
      addLog("❌ Scheduler service npub not provided.");
      return;
    }
    let svcPk;
    try {
      svcPk = svcNpub.startsWith('npub1')
        ? nip19.decode(svcNpub).data
        : svcNpub;
    } catch (e: any) {
      addLog("❌ Invalid service npub: " + (e.message || e));
      return;
    }

    addLog("⏳ Building NIP-52 event...");
    try {
      // 1. Ephemeral key for DM
      const ephSk = generateSecretKey();
      const ephPk = getPublicKey(ephSk);

      // 2. Encrypt token for recipient using NIP-04
      const enc = await nip04.encrypt(ephSk, recipientPubkey, token);

      // 3. Build unsigned DM event
      const unsigned = {
        pubkey: ephPk,
        kind: 4,
        created_at: 0,
        tags: [['p', recipientPubkey]],
        content: enc,
      };

      // 4. Instruction payload
      const now = Math.floor(Date.now() / 1000);
      const sendAt = now + delayMinutes * 60;
      // Use browser-friendly hex conversion (not Buffer)
      const ephSkHex = Array.from(ephSk).map(x => x.toString(16).padStart(2, '0')).join('');
      const instr = JSON.stringify({
        target_send_timestamp: sendAt,
        unsigned_dm_json: JSON.stringify(unsigned),
        ephemeral_nsec_hex: ephSkHex
      });

      // 5. Encrypt instruction for scheduler service
      const encInstr = await nip04.encrypt(schedulerSk, svcPk, instr);

      // 6. Build NIP-52 event
      const uuid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);

      const event: any = {
        kind: 31923,
        pubkey: schedulerPk,
        created_at: now,
        tags: [
          ['d', uuid],
          ['name', 'Cashu → Donation'],
          ['start', sendAt.toString()],
          ['p', svcPk],
          ['t', 'cashu_schedule_instruction_nip52_v1'],
        ],
        content: encInstr,
      };
      // 7. Hash & sign
      event.id = getEventHash(event);
      const signed = finalizeEvent(event, schedulerSk);

      // 8. Publish to relays
      const pool = new SimplePool();
      const pubs = await pool.publish(RELAYS, signed);
      addLog(`✅ Scheduled! Published to ${pubs.length} relay(s) as event ${signed.id}`);
    } catch (e: any) {
      addLog("❌ Schedule error: " + (e.message || e));
    }
  }

  // --- Pass state/setters down to children for data flow ---
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
