import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface Country {
  code: string;   // ISO 2-letter, e.g. "IN"
  name: string;
  dial: string;   // e.g. "+91"
  flag: string;   // emoji flag
}

// Top countries + comprehensive list
const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', dial: '+977', flag: '🇳🇵' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
  { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
  { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
  { code: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', dial: '+965', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', dial: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', dial: '+968', flag: '🇴🇲' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴' },
  { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭' },
  { code: 'BE', name: 'Belgium', dial: '+32', flag: '🇧🇪' },
  { code: 'AT', name: 'Austria', dial: '+43', flag: '🇦🇹' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷' },
  { code: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬' },
  { code: 'GH', name: 'Ghana', dial: '+233', flag: '🇬🇭' },
  { code: 'ET', name: 'Ethiopia', dial: '+251', flag: '🇪🇹' },
  { code: 'TZ', name: 'Tanzania', dial: '+255', flag: '🇹🇿' },
  { code: 'RU', name: 'Russia', dial: '+7', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', dial: '+380', flag: '🇺🇦' },
  { code: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱' },
  { code: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰' },
];

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryChange: (country: Country) => void;
  onPhoneChange: (phone: string) => void;
  disabled?: boolean;
  error?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  countryCode,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
  disabled = false,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedCountry = COUNTRIES.find((c) => c.dial === countryCode) || COUNTRIES[0];

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">
        Phone Number
      </label>
      <div className={`
        flex items-center rounded-2xl border transition-all duration-300 overflow-visible relative
        ${error ? 'border-red-400/50 bg-red-400/5' : focused ? 'border-brand-gold/50 bg-white/[0.08]' : 'border-white/10 bg-white/5'}
      `}>
        {/* Country Picker Button */}
        <div ref={dropdownRef} className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => !disabled && setOpen(!open)}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-4 text-sm font-semibold text-white/80 hover:text-brand-gold transition-colors border-r border-white/10 h-full rounded-l-2xl disabled:opacity-50 disabled:cursor-not-allowed select-none"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="text-lg leading-none">{selectedCountry.flag}</span>
            <span className="text-white/60 text-sm">{selectedCountry.dial}</span>
            <ChevronDown
              size={14}
              className={`text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute top-full left-0 z-50 mt-2 w-72 bg-[#1E120A] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-white/10 flex items-center gap-2">
                <Search size={14} className="text-white/30 flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 outline-none"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-white/30 hover:text-white/60">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Country List */}
              <div className="max-h-60 overflow-y-auto scrollbar-hide">
                {filtered.length === 0 ? (
                  <div className="px-4 py-6 text-center text-white/30 text-sm">No countries found</div>
                ) : (
                  filtered.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        onCountryChange(country);
                        setOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 text-sm text-left
                        hover:bg-brand-gold/10 transition-colors
                        ${selectedCountry.code === country.code ? 'bg-brand-gold/15 text-brand-gold' : 'text-white/70'}
                      `}
                    >
                      <span className="text-lg leading-none w-6">{country.flag}</span>
                      <span className="flex-1 truncate">{country.name}</span>
                      <span className="text-white/40 text-xs font-mono">{country.dial}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value.replace(/[^\d\s\-()]/g, ''))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="9876543210"
          disabled={disabled}
          className="flex-1 bg-transparent px-4 py-4 text-white placeholder:text-white/10 outline-none text-sm disabled:opacity-50"
        />
      </div>
      {error && (
        <p className="text-red-400/80 text-xs ml-1 mt-1">{error}</p>
      )}
    </div>
  );
};

export { COUNTRIES };
export default PhoneInput;
