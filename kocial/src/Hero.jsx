import React, { useState, useEffect } from 'react';
import './css/Hero.css';
import NavBar from './Navbar';

const phrases = ["이슈 히스토리", "진출가능성평가", "트렌드 분석"];

function Hero() {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer;
    const handleTyping = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      setText(isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 30 : 150);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 500);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <div className="hero">
      <div className="hero-content">
        <NavBar/>
        <h1 className="hero-title"> KOCIAL</h1>
        <p className="hero-subtitle">{text}</p>
        <button className="hero-button">바로 시작하기 →</button>
      </div>
      <div className="hero-shapes">
        <div className="shape shape-1">O</div>
        <div className="shape shape-2">A</div>
        <div className="shape shape-3">I</div>
        <div className="shape shape-4">K</div>
        <div className="shape shape-5">L</div>
        <div className="shape shape-6">C</div>
      </div>
    </div>


  );
}

export default Hero;