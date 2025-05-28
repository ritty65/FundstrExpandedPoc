import React, { useState, useEffect } from 'react';
import {
  generateSecretKey,
  getPublicKey,
  nip19,
} from 'nostr-tools';

type SchedulerIdentityProps = {
  onIdentityChanged?: (sk: Uint8Array, nsec: string, pk: string) => void;
};

const SchedulerIdentity: React.FC<SchedulerIdentityProps> = ({ onIdentityChanged }) => {
  const [nsec, setNsec] = useState<string | null>(null);
  const [npub, setNpub] = useState<string | null>(null);
  const [inputNsec, setInputNsec] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [skBytes, setSkBytes] = useState<Uint8Array | null>(null);
  const [pkHex, setPkHex] = useState<string | null>(null);

  useEffect(() => {
    if (skBytes && nsec && pkHex && onIdentityChanged) {
      onIdentityChanged(skBytes, nsec, pkHex);
    }
  }, [skBytes, nsec, pkHex, onIdentityChanged]);

  const handleGenerate = () => {
    try {
      setError(null);
      const sk = generateSecretKey();
      const pk = getPublicKey(sk);
      const nsecVal = nip19.nsecEncode(sk);
      const npubVal = nip19.npubEncode(pk);
      setSkBytes(sk);
      setPkHex(pk);
      setNsec(nsecVal);
      setNpub(npubVal);
    } catch (e: any) {
      setError('Key generation failed: ' + e.message);
    }
  };

  const handleLoad = () => {
    setError(null);
    try {
      const d = nip19.decode(inputNsec.trim());
      if (d.type !== 'nsec') throw new Error('Not a valid nsec');
      const pk = getPublicKey(d.data);
      setSkBytes(d.data);
      setPkHex(pk);
      setNsec(nip19.nsecEncode(d.data));
      setNpub(nip19.npubEncode(pk));
    } catch (e: any) {
      setError('Invalid nsec: ' + (e.message || e));
      setNsec(null);
      setNpub(null);
      setSkBytes(null);
      setPkHex(null);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Scheduler Identity</h2>
      <button className="btn" onClick={handleGenerate}>🔑 Generate New Scheduler Keys</button>
      <input
        className="input"
        type="text"
        value={inputNsec}
        onChange={e => setInputNsec(e.target.value)}
        placeholder="Or paste existing nsec and click Load"
      />
      <button className="btn btn-secondary" onClick={handleLoad}>⬆️ Load Scheduler Nsec</button>
      {error && <div className="error-text">{error}</div>}
      <div style={{ fontSize: '0.99rem' }}>
        <div>
          <strong style={{ color: "#475569" }}>Active nsec:</strong>{" "}
          <code style={{ color: "#dc2626", background: "#fee2e2", padding: "2px 4px", borderRadius: "4px" }}>{nsec ?? 'Not set'}</code>
        </div>
        <div>
          <strong style={{ color: "#475569" }}>Active npub:</strong>{" "}
          <code style={{ color: "#16a34a", background: "#bbf7d0", padding: "2px 4px", borderRadius: "4px" }}>{npub ?? 'Not set'}</code>
        </div>
      </div>
    </div>
  );
};

export default SchedulerIdentity;
