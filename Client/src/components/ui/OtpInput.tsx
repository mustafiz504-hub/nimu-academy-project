import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string[];
  onChange: (otp: string[]) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Reusable 6-box OTP input component.
 * - Auto-advances on digit entry
 * - Backspace navigates back to previous box
 * - Supports paste of full code into first box
 */
const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const raw = e.target.value;

    // Handle paste of full OTP
    if (raw.length > 1) {
      const digits = raw.replace(/\D/g, '').slice(0, length).split('');
      const newOtp = Array(length).fill('');
      digits.forEach((d, i) => { newOtp[i] = d; });
      onChange(newOtp);
      const nextIdx = Math.min(digits.length, length - 1);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const digit = raw.replace(/\D/g, '').slice(-1);
    const newOtp = [...value];
    newOtp[index] = digit;
    onChange(newOtp);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...value];
        newOtp[index] = '';
        onChange(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="flex items-center justify-center gap-2 md:gap-3" role="group" aria-label="OTP input">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          id={`otp-box-${index}`}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={index === 0 ? length : 1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={handleFocus}
          disabled={disabled}
          autoComplete="one-time-code"
          className={`
            w-11 h-14 md:w-12 md:h-16 rounded-2xl border-2 text-center text-xl font-black
            transition-all duration-200 outline-none select-all
            ${value[index]
              ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
              : 'border-white/10 bg-white/5 text-white'
            }
            focus:border-brand-gold focus:bg-brand-gold/5 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.15)]
            disabled:opacity-40 disabled:cursor-not-allowed
            placeholder:text-white/10
          `}
          placeholder="·"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
