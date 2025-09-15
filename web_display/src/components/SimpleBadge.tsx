import React from 'react';

interface SimpleBadgeProps {
  text: string;
  count: number | string;
  color: string;
  title?: string;
}

const SimpleBadge: React.FC<SimpleBadgeProps> = ({ text, count, color, title }) => {
  return (
    <div
      title={String(count)}
      style={{
        display: 'inline-block',
        textAlign: 'center',
        cursor: 'default',
      }}
    >
      {/* Rectangle with text */}
      <div
        style={{
          backgroundColor: color,
          color: '#fff',
          padding: '0 6px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          height: '20px',
          lineHeight: '20px',
          minWidth: '20px',
          display: 'inline-block',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '200px',
          boxSizing: 'border-box',
        }}
      >
        {count}
      </div>
      {/* text below */}
      <div
        style={{
          fontSize: '14px',
          color: '#000000ff',
          marginTop: '1px',
          lineHeight: '1',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default SimpleBadge;
