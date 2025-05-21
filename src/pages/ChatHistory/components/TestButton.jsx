import React from 'react';

const TestButton = ({ onClick, chatId }) => {
  const handleClick = () => {
    console.log('Test button clicked with chatId:', chatId);
    onClick(chatId);
  };

  return (
    <button 
      onClick={handleClick}
      style={{
        background: 'red',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      TEST VIEW
    </button>
  );
};

export default TestButton;
