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
    // eslint-disable-next-line
  }, [skBytes, nsec, pkHex]);

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
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Scheduler Identity</h2>
      <button
        onClick={handleGenerate}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mb-3"
      >
        Generate New Scheduler Keys
      </button>
      <div className="mb-3">
        <input
          type="text"
          value={inputNsec}
          onChange={e => setInputNsec(e.target.value)}
          placeholder="Or paste existing nsec and click Load"
          className={`w-full p-2 border ${error ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
        />
      </div>
      <button
        onClick={handleLoad}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg mb-3"
      >
        Load Scheduler Nsec
      </button>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="text-sm">
        <p className="text-gray-600 break-all"><strong>Active nsec:</strong>
          <code className="text-red-500 bg-red-50 p-1 rounded">{nsec ?? 'Not set'}</code>
        </p>
        <p className="text-gray-600 break-all mt-1"><strong>Active npub:</strong>
          <code className="text-green-500 bg-green-50 p-1 rounded">{npub ?? 'Not set'}</code>
        </p>
      </div>
    </div>
  );
};

export default SchedulerIdentity;
