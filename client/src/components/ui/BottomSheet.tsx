import { useEffect, useRef } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        ref={sheetRef}
        className="relative w-full max-w-md bg-white rounded-t-[2rem] shadow-2xl transform transition-transform duration-300 ease-out animate-slide-up max-h-[85vh] overflow-y-auto no-scrollbar"
      >
        <div className="sticky top-0 bg-white pt-3 pb-2 px-5 flex justify-center z-10">
          <div className="w-10 h-1.5 bg-gray-200 rounded-full" />
        </div>
        {children}
      </div>
    </div>
  );
}
