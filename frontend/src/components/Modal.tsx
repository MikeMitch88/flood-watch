import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="glass-strong rounded-2xl border border-rain-600/30 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-elevation-lg animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 glass-strong border-b border-rain-700/50 p-6 flex items-center justify-between backdrop-blur-md">
                    <h3 className="text-2xl font-bold text-white">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-rain-400 hover:text-white"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
                {footer && <div className="border-t border-rain-700/50 p-6">{footer}</div>}
            </div>
        </div>
    );
};
