import React, { useState } from "react";

type DonationDetailsProps = {
  onReadyToSchedule?: (token: string, delayMinutes: number) => void;
};

const DonationDetails: React.FC<DonationDetailsProps> = ({ onReadyToSchedule }) => {
  const [token, setToken] = useState("");
  const [delay, setDelay] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSchedule = () => {
    setError(null);
    setStatus(null);
    if (!token.trim()) {
      setError("Cashu token is required.");
      return;
    }
    if (isNaN(delay) || delay < 0) {
      setError("Delay must be a non-negative number.");
      return;
    }
    setStatus("Ready to schedule!");
    if (onReadyToSchedule) onReadyToSchedule(token.trim(), delay);
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Donation Details</h2>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Cashu Token:</label>
        <textarea
          value={token}
          onChange={e => setToken(e.target.value)}
          rows={3}
          placeholder="Paste Cashu token here"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 items-end">
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">Delay (minutes):</label>
          <input
            type="number"
            value={delay}
            min={0}
            onChange={e => setDelay(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSchedule}
          className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
          disabled={!token.trim() || delay < 0}
        >
          Schedule Donation
        </button>
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {status && <div className="text-green-600 text-sm mt-2">{status}</div>}
    </div>
  );
};

export default DonationDetails;
