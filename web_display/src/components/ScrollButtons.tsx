import React from 'react';

interface ScrollButtonsProps {
  scrollToTop: () => void;
  scrollToBottom: () => void;
}

const ScrollButtons: React.FC<ScrollButtonsProps> = ({ scrollToTop, scrollToBottom }) => {
  return (
    <div style={{
      position: 'fixed',
      right: '40px',
      bottom: '120px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <button
        onClick={scrollToTop}
        style={{
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid #ccc',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '22px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        title="Go Top"
      >
        <span style={{ display: 'inline-block', transform: 'translateY(-2px)' }}>▲</span>
      </button>
      <button
        onClick={scrollToBottom}
        style={{
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid #ccc',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '22px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        title="Go Bottom"
      >
        <span style={{ display: 'inline-block', transform: 'translateY(2px)' }}>▼</span>
      </button>
    </div>
  );
};

export default ScrollButtons;
