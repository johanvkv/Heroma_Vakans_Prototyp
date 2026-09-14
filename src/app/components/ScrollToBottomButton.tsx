import React, { useState, useEffect } from 'react';

export const ScrollToBottomButton = () => {
  const [showButton, setShowButton] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user has scrolled down from top
      // Hide button when at the bottom of the page
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Determine scroll direction
      if (scrollTop > lastScrollY) {
        setScrollDirection('down');
      } else if (scrollTop < lastScrollY) {
        setScrollDirection('up');
      }
      setLastScrollY(scrollTop);
      
      // Show button if scrolled more than 50px from top
      // Hide button if within 100px of the bottom
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 100;
      const isScrolledFromTop = scrollTop > 50;
      
      setShowButton(isScrolledFromTop && !isNearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!showButton) {
    return null;
  }

  return (
    <button 
      className="scroll-to-bottom-btn"
      onClick={scrollDirection === 'up' ? scrollToTop : scrollToBottom}
      type="button"
      aria-label={scrollDirection === 'up' ? 'Scroll to top' : 'Scroll to bottom'}
    >
      <i className={`fa-solid fa-arrow-${scrollDirection === 'up' ? 'up' : 'down'}`}></i>
    </button>
  );
};