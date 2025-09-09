import React from 'react';

const ReusableModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
            }}
        >
            <div
                style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    width: '400px',
                    maxWidth: '90%',
                    textAlign: 'center',
                    position: 'relative',
                }}
            >
                {/* Close Icon */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '18px',
                        cursor: 'pointer',
                    }}
                >
                    ✖
                </button>

                {title && <h3>{title}</h3>}

                {/* Modal content */}
                <div>{children}</div>

                {/* Footer Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        marginTop: '15px',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: '#007bff',
                        color: 'white',
                        cursor: 'pointer',
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ReusableModal;