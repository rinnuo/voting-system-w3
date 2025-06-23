import React, { useState, useRef, useEffect } from "react";

interface DropdownProps {
  label: string;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ label, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);
  const handleFocus = () => setOpen(true);
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!ref.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  return (
    <div
      className="relative inline-block"
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
    >
      <span
        className="text-gray-300 hover:text-white px-3 py-2 rounded focus:outline-none flex items-center gap-2 cursor-pointer select-none"
      >
        {label}
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ⏷
        </span>
      </span>
      {open && (
        <div className="absolute left-0 top-full w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
          <div className="py-2">{children}</div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;