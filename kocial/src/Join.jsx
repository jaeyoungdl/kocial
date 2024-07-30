import React, { useState } from 'react';
import axios from 'axios';
import { Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './css/Join.css';

const Join = () => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [idAvailable, setIdAvailable] = useState(null);
  const navigate = useNavigate();

  const checkIdAvailability = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/check-id/${id}`);
      setIdAvailable(response.data.available);
    } catch (error) {
      console.error('ID 중복 검사 오류:', error);
      setIdAvailable(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (idAvailable !== true) {
      alert('사용할 수 없는 아이디입니다. 다른 아이디를 선택해주세요.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/signup', {
        u_id: id,
        u_pw: pw,
        u_name: name,
        u_add: address,
        u_email: email,
        u_tel: tel
      });
      console.log(response.data);
      alert('회원가입이 성공적으로 완료되었습니다.');
      navigate('/Login');
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="logo">
          <Globe className="mr-2" />
          <h1 className='login-kocial'>KOCIAL</h1>
        </div>
        <h2 className='login-text'>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <div className="id-input-container">
            <input
              type="text"
              placeholder="아이디"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setIdAvailable(null);
              }}
            />
            <button type="button" className="check-id-button" onClick={checkIdAvailability}>중복 확인</button>
          </div>
          {idAvailable !== null && (
            <p className={idAvailable ? "id-available" : "id-not-available"}>
              {idAvailable ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다."}
            </p>
          )}
          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="주소"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="tel"
            placeholder="전화번호"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
          />
          <button type="submit" className="sign-in-button">
            JOIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Join;