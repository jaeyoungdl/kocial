import React, { useState, useEffect } from 'react';
import './css/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const Login = () => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // 카카오 SDK 초기화
    const initKakao = async () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        await window.Kakao.init('dda96a1a63ca7218188c2bfb063b1a0a');
        console.log(window.Kakao.isInitialized() ? "카카오 SDK 초기화 성공" : "카카오 SDK 초기화 실패");
      }
    };

    initKakao();
  }, []);

  const validateForm = () => {
    if (!id) {
      setError('아이디를 입력해주세요.');
      return false;
    }
    if (!pw) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) {
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/login', {
        u_id: id,
        u_pw: pw
      });
      console.log(response.data);
    
      await login(id, pw);
    
      alert('로그인 성공!');
      navigate('/');
    } catch (error) {
      console.error('로그인 오류:', error);
      if (error.response) {
        setError(error.response.data.detail || '로그인 중 오류가 발생했습니다.');
      } else if (error.request) {
        setError('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        setError('로그인 요청 중 오류가 발생했습니다.');
      }
    }
  };

  const handleKakaoLogin = () => {
    if (window.Kakao) {
      const REDIRECT_URI = 'http://localhost:8000/kakao-callback'; // FastAPI 서버의 콜백 URL
      
      window.Kakao.Auth.authorize({
        redirectUri: REDIRECT_URI,
        scope: 'profile_nickname, account_email', // 필요한 scope 지정
      });
    } else {
      console.error('Kakao SDK not loaded');
      setError('카카오 로그인을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="logo">
          <div className='container'>
            <Globe className="mr-2" />
            <h1>KOCIAL</h1>
          </div>
        </div>
      
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button type="submit" className="sign-in-button">
            로그인
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <button onClick={handleKakaoLogin} className="kakao-login-button">
          카카오톡 로그인
        </button>
        <p className="create-account">
          <Link to='/Join'>회원가입</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;