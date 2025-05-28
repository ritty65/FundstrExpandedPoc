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
    <div className="card">
      <h2 className="section-title">Donation Details</h2>
      <div>
        <label className="label">Cashu Token:</label>
        <textarea
          className="input"
          value={token}
          onChange={e => setToken(e.target.value)}
          rows={3}
          placeholder="Paste Cashu token here"
          maxLength={TOKEN_MAX_LENGTH}
          disabled={scheduleDisabled}
        />
      </div>
      <div className="flex-row" style={{marginBottom:"0.8rem"}}>
        <div style={{flexGrow: 1}}>
          <label className="label">Delay (minutes):</label>
          <input
            className="input"
            type="number"
            value={delay}
            min={DELAY_MIN}
            max={DELAY_MAX}
            onChange={e => setDelay(Number(e.target.value))}
            disabled={scheduleDisabled}
          />
        </div>
        <button
          className="btn btn-green"
          onClick={handleSchedule}
          disabled={scheduleDisabled}
        >
          💸 Schedule Donation
        </button>
      </div>
      {error && <div className="error-text">{error}</div>}
      {status && <div className="status-text">{status}</div>}
    </div>
  );
};

export default DonationDetails;
