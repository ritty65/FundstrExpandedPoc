import React, { useState } from "react";

type DonationDetailsProps = {
  onReadyToSchedule?: (token: string, delayMinutes: number) => void;
  scheduleDisabled?: boolean;
};

const TOKEN_MIN_LENGTH = 20;
const TOKEN_MAX_LENGTH = 2048;
const DELAY_MIN = 1;
const DELAY_MAX = 525600;
const CASHU_TOKEN_REGEX = /^cashu[a-zA-Z0-9]+/;

const DonationDetails: React.FC<DonationDetailsProps> = ({
  onReadyToSchedule,
  scheduleDisabled = false,
}) => {
  const [token, setToken] = useState("");
  const [delay, setDelay] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  function handleSchedule() {
    setError(null);
    setStatus(null);

    if (!token || token.length < TOKEN_MIN_LENGTH || token.length > TOKEN_MAX_LENGTH) {
      setError(`Cashu token length must be between ${TOKEN_MIN_LENGTH} and ${TOKEN_MAX_LENGTH} characters.`);
      return;
    }
    if (!CASHU_TOKEN_REGEX.test(token)) {
      setError("Cashu token format invalid (must start with 'cashuA').");
      return;
    }
    if (isNaN(delay) || delay < DELAY_MIN || delay > DELAY_MAX) {
      setError(`Delay must be between ${DELAY_MIN} and ${DELAY_MAX} minutes.`);
      return;
    }
    setStatus("Ready to schedule!");
    if (onReadyToSchedule) onReadyToSchedule(token.trim(), delay);
  }

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
          maxLength={TOKEN_MAX_LENGTH}
          disabled={scheduleDisabled}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 items-end">
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">Delay (minutes):</label>
          <input
            type="number"
            value={delay}
            min={DELAY_MIN}
            max={DELAY_MAX}
            onChange={e => setDelay(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={scheduleDisabled}
          />
        </div>
        <button
          onClick={handleSchedule}
          className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
          disabled={scheduleDisabled}
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
