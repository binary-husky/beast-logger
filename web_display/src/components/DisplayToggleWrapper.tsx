import React, { useState } from 'react';
import { Button } from 'antd';

// Toggle display modes
type DisplayMode = 'rich' | 'pure' | 'both';

interface DisplayToggleWrapperProps {
  currentParagraph: React.ReactElement[];
  currentText: string[];
  paragraphCount: number;
  globalShowRichText: boolean;
  globalShowPureText: boolean;
  paragraphStyle: React.CSSProperties;
  smallParagraphStyle: React.CSSProperties;
}

const DisplayToggleWrapper: React.FC<DisplayToggleWrapperProps> = ({
  currentParagraph,
  currentText,
  paragraphCount,
  globalShowRichText,
  globalShowPureText,
  paragraphStyle,
  smallParagraphStyle
}) => {
  const [localDisplayMode, setLocalDisplayMode] = useState<DisplayMode>(() => {
    if (globalShowRichText && globalShowPureText) return 'both';
    if (globalShowRichText) return 'rich';
    if (globalShowPureText) return 'pure';
    return 'both';
  });

  const localShowRichText = localDisplayMode === 'rich' || localDisplayMode === 'both';
  const localShowPureText = localDisplayMode === 'pure' || localDisplayMode === 'both';
  const isBigBreak = localShowPureText;

  return (
    <div style={{ position: 'relative', marginBottom: '8px' }}>
      {/* Toggle buttons */}
      <div style={{
        position: 'absolute',
        top: '-5px',
        right: '0px',
        zIndex: 10,
        display: 'flex',
        gap: '4px'
      }}>
        <Button
          size="small"
          type={localDisplayMode === 'rich' ? 'primary' : 'default'}
          onClick={() => setLocalDisplayMode('rich')}
          style={{ fontSize: '10px', height: '20px', padding: '0 6px' }}
        >
          Rich
        </Button>
        <Button
          size="small"
          type={localDisplayMode === 'pure' ? 'primary' : 'default'}
          onClick={() => setLocalDisplayMode('pure')}
          style={{ fontSize: '10px', height: '20px', padding: '0 6px' }}
        >
          Pure
        </Button>
        <Button
          size="small"
          type={localDisplayMode === 'both' ? 'primary' : 'default'}
          onClick={() => setLocalDisplayMode('both')}
          style={{ fontSize: '10px', height: '20px', padding: '0 6px' }}
        >
          Both
        </Button>
      </div>

      {/* Content display */}
      <>
        {/* begin rich text display */}
        {localShowRichText && (
          <p key={`paragraph-${paragraphCount}`} style={isBigBreak ? paragraphStyle : smallParagraphStyle}>
            {currentParagraph}
          </p>
        )}
        {/* end rich text display */}

        {/* begin pure text display */}
        {localShowPureText && (
          <>
            <hr style={{ margin: '4px 0', border: 0, borderTop: '1px dotted rgb(229, 19, 19)' }} />
            <p key={`paragraph-${paragraphCount}`} style={paragraphStyle}>
              <span style={{ whiteSpace: 'pre-wrap' }}>
                {currentText.length > 0 ? currentText.join('') : ''}
              </span>
            </p>
          </>
        )}
        {/* end pure text display */}

        {localShowRichText && isBigBreak && (
          <hr style={{ margin: '16px 0', border: 0, borderTop: '2px solid rgb(0, 228, 38)' }} />
        )}
      </>
    </div>
  );
};

export default DisplayToggleWrapper;
