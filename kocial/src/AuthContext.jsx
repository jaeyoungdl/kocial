import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [id, setId] = useState(localStorage.getItem('id') || '');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // URL 파라미터에서 카카오 로그인 정보 확인
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const nickname = urlParams.get('nickname');
    const name = urlParams.get('name');
    const user_id = urlParams.get('user_id');

    if (email && nickname && name && user_id) {
      handleKakaoLogin({ email, nickname, name, user_id });
    }
  }, []);

  const handleKakaoLogin = (userData) => {
    localStorage.setItem('id', userData.user_id);
    localStorage.setItem('userName', userData.name);
    setUserName(userData.name);
    setId(userData.user_id);
    setIsLoggedIn(true);
    // 여기서 토큰을 설정할 수 없으므로, 백엔드에서 토큰을 제공하도록 수정이 필요할 수 있습니다.
    navigate('/'); // 홈페이지로 리다이렉트
  };

  const login = async (u_id, u_pw) => {
    try {
      const response = await axios.post('http://localhost:8000/login', {
        u_id,
        u_pw
      });
      
      const { message, user } = response.data;
  
      if (message === 'Login successful') {
        localStorage.setItem('token', user.token);
        localStorage.setItem('id', user.u_id);
        localStorage.setItem('userName', user.u_name);
        setUserName(user.u_name);
        setId(user.u_id);
        setIsLoggedIn(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        console.log('Login successful. Username:', user.u_name);
      } else {
        console.error('Login failed:', message);
        throw new Error('Login failed: ' + message);
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data?.detail || error.message);
      throw error;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('id');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setUserName('');
    setId('');
    setIsLoggedIn(false);
    delete axios.defaults.headers.common['Authorization'];
  };


  
const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  const userId = localStorage.getItem('id'); // 클라이언트에서 저장된 ID 가져오기

  if (newPassword !== confirmPassword) {
    console.error('New password and confirmation do not match');
    return;
  }

  try {
    const response = await axios.post('http://localhost:8000/change-password', 
      {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
        u_id: userId // 서버에 ID도 함께 전송
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // 서버에서 받은 실제 토큰 사용
          'Content-Type': 'application/json',
        }
      }
    );

    // 응답 데이터의 전체 구조를 확인합니다
    console.log('Response data:', response.data);

    // 응답 데이터가 예상한 구조를 가진다면, 특정 필드에 접근할 수 있습니다
    // 예를 들어, 응답 데이터가 { message: "Password changed successfully" }와 같은 구조라고 가정할 때
    if (response.data.message) {
      console.log('Message:', response.data.message);
    }
    
    console.log('Password changed successfully');
  } catch (error) {
    console.error('Error changing password:', error.response?.data?.detail || error.message);
  }
};
  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, userName, changePassword}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);