import React from 'react';
import { Delete } from 'lucide-react';

export default function NumberPad({ 
  value = "", 
  onChange, 
  onSubmit, 
  maxLength = 3, 
  placeholder = "?" 
}) {
  const handleNumClick = (num) => {
    if (value.length < maxLength) {
      onChange(value + num.toString());
    }
  };

  const handleBackspace = () => {
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange("");
  };

  const buttons = [
    1, 2, 3,
    4, 5, 6,
    7, 8, 9,
    "C", 0, "backspace"
  ];

  return (
    <div className="custom-number-pad">
      {/* Display screen */}
      <div className="numpad-screen">
        <span className={value ? "numpad-val" : "numpad-placeholder"}>
          {value || placeholder}
        </span>
      </div>

      {/* Button Grid */}
      <div className="numpad-grid">
        {buttons.map((btn, idx) => {
          if (btn === "backspace") {
            return (
              <button 
                key={`numpad-btn-${idx}`}
                className="numpad-btn numpad-btn-action"
                onClick={handleBackspace}
                aria-label="Backspace"
              >
                <Delete size={20} />
              </button>
            );
          }
          if (btn === "C") {
            return (
              <button 
                key={`numpad-btn-${idx}`}
                className="numpad-btn numpad-btn-action font-fredoka"
                onClick={handleClear}
                aria-label="Clear value"
              >
                C
              </button>
            );
          }
          return (
            <button 
              key={`numpad-btn-${idx}`}
              className="numpad-btn numpad-btn-number font-fredoka"
              onClick={() => handleNumClick(btn)}
              aria-label={`Number ${btn}`}
            >
              {btn}
            </button>
          );
        })}
      </div>

      {/* Large Go/Check button */}
      {onSubmit && (
        <button 
          className="numpad-submit font-fredoka"
          onClick={onSubmit}
          disabled={!value}
          aria-label="Submit answer"
        >
          Check Answer
        </button>
      )}
    </div>
  );
}
