import { useState, useRef, useEffect } from 'react';
import { Check, Plus } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export default function ComboboxInput({ value, onChange, options, placeholder }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부에서 value가 변경되면 inputValue 동기화
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  // 입력값이 기존 옵션에 정확히 일치하지 않으면 새 항목 추가 옵션 표시
  const exactMatch = options.some(opt => opt.toLowerCase() === inputValue.toLowerCase());
  const showNewOption = inputValue.trim() && !exactMatch;

  const handleSelect = (val: string) => {
    setInputValue(val);
    onChange(val);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className="w-full border border-border bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        placeholder={placeholder}
      />

      {isOpen && (filtered.length > 0 || showNewOption) && (
        <ul className="absolute z-50 w-full mt-1.5 bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(opt => (
            <li
              key={opt}
              onClick={() => handleSelect(opt)}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-brand-50 text-sm transition-colors"
            >
              {opt === value ? (
                <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span className="text-text-primary">{opt}</span>
            </li>
          ))}
          {showNewOption && (
            <li
              onClick={() => handleSelect(inputValue.trim())}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-emerald-50 text-sm text-emerald-700 border-t border-border transition-colors"
            >
              <Plus className="w-3.5 h-3.5 flex-shrink-0" />
              <span>새로 추가: <span className="font-semibold">{inputValue.trim()}</span></span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
