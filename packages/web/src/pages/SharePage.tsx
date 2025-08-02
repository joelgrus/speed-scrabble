import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { parseShareUrl, type GameResult } from '@ss/shared';

export function SharePage() {
  const location = useLocation();
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const fullUrl = `${window.location.origin}${location.pathname}${location.search}`;
      const result = parseShareUrl(fullUrl);
      setGameResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shared game');
    }
  }, [location]);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #E8F5E8, #C8E6C9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#D32F2F', marginBottom: '16px' }}>
            Invalid Share Link
          </h1>
          <p style={{ color: '#666' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!gameResult) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #E8F5E8, #C8E6C9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ fontSize: '20px' }}>Loading...</div>
      </div>
    );
  }

  const { username, date, width, height, grid, time } = gameResult;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #E8F5E8, #C8E6C9)',
      padding: '16px',
      fontFamily: 'Arial, sans-serif',
      overflow: 'auto',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        maxWidth: '768px', 
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h1 style={{
            fontSize: '30px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '8px',
            fontFamily: 'Georgia, serif'
          }}>
            Speed Scrabble Result
          </h1>
          <div style={{
            textAlign: 'center',
            fontSize: '18px',
            color: '#666',
            marginBottom: '12px'
          }}>
            {username} • {date}
          </div>
          <div style={{
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#4CAF50',
            marginBottom: '24px',
            fontFamily: 'monospace'
          }}>
            Time: {formattedTime}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>
            Final Grid ({width} × {height})
          </h2>
          <div 
            style={{
              display: 'grid',
              gap: '1px',
              margin: '0 auto',
              width: 'fit-content',
              gridTemplateColumns: `repeat(${width}, 1fr)`,
              maxWidth: '100%',
              overflow: 'auto',
              border: '2px solid #ccc',
              borderRadius: '4px'
            }}
          >
            {Array.from(grid).map((char, index) => {
              const isEmpty = char === '.';
              // Better responsive calculation - ensure minimum readable size
              const maxCellSize = Math.min(40, Math.floor((window.innerWidth - 100) / width));
              const cellSize = Math.max(16, maxCellSize); // Never smaller than 16px
              const fontSize = Math.max(10, Math.floor(cellSize * 0.6)); // Proportional font
              
              return (
                <div
                  key={index}
                  style={{
                    width: cellSize + 'px',
                    height: cellSize + 'px',
                    border: '1px solid',
                    borderColor: isEmpty ? '#ddd' : '#8B6B47',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: fontSize + 'px',
                    fontWeight: 'bold',
                    background: isEmpty ? '#f8f8f8' : '#FAF8F3',
                    color: isEmpty ? 'transparent' : '#3E2723',
                    boxSizing: 'border-box'
                  }}
                >
                  {isEmpty ? '' : String(char)}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a 
            href="/"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(to bottom, #4CAF50, #388E3C)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🎲 Play Speed Scrabble
          </a>
        </div>
      </div>
    </div>
  );
}