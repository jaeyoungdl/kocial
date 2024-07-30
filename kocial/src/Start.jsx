import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './css/Start.css';
import Navbar from './Navbar';

const phrases = ["이슈 히스토리", "진출가능성평가", "트렌드 분석", "Korea Wave"];

const ScrollIndicator = ({ onClick, isScrolledDown }) => {
  return (
    <div className={`scroll-indicator ${isScrolledDown ? 'scrolled-down' : ''}`} onClick={onClick}>
      <span className="scroll-indicator-text">
        {isScrolledDown ? 'UP' : 'DOWN'}
      </span>
      {isScrolledDown ? (
        <ChevronUp className="scroll-indicator-arrow" />
      ) : (
        <ChevronDown className="scroll-indicator-arrow" />
      )}
    </div>
  );
};

function Start() {
  const [text, setText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [loopNum, setLoopNum] = React.useState(0);
  const [typingSpeed, setTypingSpeed] = React.useState(150);
  const [isScrolledDown, setIsScrolledDown] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
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

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      
      setIsScrolledDown(scrollPosition + windowHeight >= fullHeight - 10); // 오프셋을 추가해 불필요한 오차 방지
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [text, isDeleting, loopNum, typingSpeed]);

  const handleStartClick = () => {
    navigate('/main');
  };

  const handleScrollClick = () => {
    if (isScrolledDown) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const nextSection = document.querySelector('.scroll-section');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.error("클래스 'scroll-section'을 가진 요소를 찾을 수 없습니다.");
      }
    }
  };

  return (
    <div className="start-container">
      <div className="hero">
        <Navbar />
        <div className="hero-content">
          <h1 className="hero-title">K-성공예측기</h1>
          <p className="hero-subtitle">{text}</p>
          <button className="hero-button" onClick={handleStartClick}>바로 시작하기 →</button>
        </div>
      </div>
      
      <div className="scroll-section">
        <div className="section-content">
          <h2 className="start-h2 ">이제 해외 진출 가능성을 편하게 예측하세요!</h2>
          <p className="start-p">" KOCIAL은 한류 콘텐츠의 글로벌 진출 가능성을 평가하고 지원하는 플랫폼입니다.
            <br /> 한류의 다양한 분야를 분석하여 해외 시장에서의 성공 가능성을 평가합니다. 
            <br /> KOCIAL과 함께 한류의 세계 무대로의 도약을 준비하세요!"</p>
        </div>
        <div className="info-boxes">
          <div className="info-box1">
            <div className="step">Step 1</div>
            <div className="description">
              5국가에서 이슈를 추출 받으세요!
            </div>
          </div>
          <div className="info-box2">
            <div className="step">Step 2</div>
            <div className="description">
              선택한 국가의 궁금증을 해결하고
              <br /> 이슈를 포착하세요!
            </div>
          </div>
          <div className="info-box3">
            <div className="step">Step 3</div>
            <div className="description">
              자! 이제 해외진출가능성을 추측해봅시다!
            </div>
          </div>
        </div>
      </div>

      <ScrollIndicator onClick={handleScrollClick} isScrolledDown={isScrolledDown} />
    </div>
  );
}

export default Start;
