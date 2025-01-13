import React, { useRef } from 'react';

const SynchronizedScroll = () => {
  const container1Ref = useRef(null);
  const container2Ref = useRef(null);

  const handleScroll = (source, target) => {
    const sourceScrollTop = source.scrollTop;
    target.scrollTop = sourceScrollTop;
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* First Scrollable Container */}
      <div
        ref={container1Ref}
        style={{
          width: '300px',
          height: '400px',
          overflowY: 'scroll',
          border: '1px solid black',
        }}
        onScroll={() =>
          handleScroll(container1Ref.current, container2Ref.current)
        }
      >
        <div style={{ height: '800px', background: '#f0f0f0' }}>
          <p>Container 1 Content</p>
          {/* Add more content here */}
        </div>
      </div>

      {/* Second Scrollable Container */}
      <div
        ref={container2Ref}
        style={{
          width: '300px',
          height: '400px',
          overflowY: 'scroll',
          border: '1px solid black',
        }}
        onScroll={() =>
          handleScroll(container2Ref.current, container1Ref.current)
        }
      >
        <div style={{ height: '800px', background: '#d0d0d0' }}>
          <p>Container 2 Content</p>
          {/* Add more content here */}
        </div>
      </div>
    </div>
  );
};

export default SynchronizedScroll;
