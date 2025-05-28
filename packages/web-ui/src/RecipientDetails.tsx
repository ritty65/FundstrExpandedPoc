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
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Recipient Details</h2>
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Recipient npub or hex pubkey"
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || input.length === 0}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center"
        >
          {loading ? (
            <>
              <span>Searching…</span>
              <span className="ml-2 animate-spin">🔄</span>
            </>
          ) : (
            "Search Metadata"
          )}
        </button>
      </div>
      <div className="flex items-center space-x-3 text-gray-700">
        <img
          src={avatar}
          alt="Recipient Avatar"
          className="w-12 h-12 rounded-full bg-gray-200"
          onError={e => (e.currentTarget.src = AVATAR_PLACEHOLDER)}
        />
        <div>
          <strong>Name:</strong> <span>{name}</span>
        </div>
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default RecipientDetails;
