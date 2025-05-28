import React, { useState } from "react";
import { nip19, SimplePool } from "nostr-tools";

const AVATAR_PLACEHOLDER = "https://placehold.co/48x48/e2e8f0/cbd5e1?text=?";
const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://nos.lol",
  "wss://relay.nostr.band",
  "wss://nostr.wine",
  "wss://purplepag.es",
  "wss://relay.snort.social"
];

type RecipientDetailsProps = {
  onRecipientValid?: (pubkeyHex: string) => void;
};

function isHexKey(input: string): boolean {
  return /^[0-9A-Fa-f]{64}$/.test(input);
}

const RecipientDetails: React.FC<RecipientDetailsProps> = ({ onRecipientValid }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("N/A");
  const [avatar, setAvatar] = useState(AVATAR_PLACEHOLDER);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setError(null);
    setName("N/A");
    setAvatar(AVATAR_PLACEHOLDER);

    let pubkey: string = "";
    try {
      if (input.startsWith("npub1")) {
        const d = nip19.decode(input);
        if (d.type !== "npub" || !d.data) {
          throw new Error("Not a valid npub");
        }
        pubkey = d.data;
      } else if (isHexKey(input)) {
        pubkey = input;
      } else {
        throw new Error("Invalid pubkey or npub format");
      }
    } catch (e: any) {
      setError("Invalid recipient key: " + (e.message || e));
      return;
    }

    setLoading(true);
    try {
      const pool = new SimplePool();
      const evt = await pool.get(RELAYS, { kinds: [0], authors: [pubkey], limit: 1 });
      if (!evt) throw new Error("Metadata not found");
      const p = JSON.parse(evt.content);
      setName(p.name || p.display_name || "N/A");
      setAvatar(p.picture || AVATAR_PLACEHOLDER);
      setError(null);
      if (onRecipientValid) onRecipientValid(pubkey);
    } catch (e: any) {
      setError("Metadata error: " + (e.message || e));
      setName("N/A");
      setAvatar(AVATAR_PLACEHOLDER);
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2 className="section-title">Recipient Details</h2>
      <div className="flex-row" style={{marginBottom:"1.2rem"}}>
        <input
          className="input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Recipient npub or hex pubkey"
          disabled={loading}
        />
        <button
          className="btn btn-secondary"
          onClick={handleSearch}
          disabled={loading || input.length === 0}
        >
          {loading ? <>Searching...</> : <>Search Metadata</>}
        </button>
      </div>
      <div className="flex-row" style={{marginBottom:"0.8rem"}}>
        <img
          className="avatar"
          src={avatar}
          alt="Recipient Avatar"
          onError={e => (e.currentTarget.src = AVATAR_PLACEHOLDER)}
        />
        <div>
          <strong>Name:</strong> <span>{name}</span>
        </div>
      </div>
      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default RecipientDetails;
