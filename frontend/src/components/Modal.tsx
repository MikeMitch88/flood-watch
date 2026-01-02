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
        <div className="modal-overlay" onClick={onClose}>
            <div
                ref={modalRef}
                className="modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="btn-glass"
                        style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
};
