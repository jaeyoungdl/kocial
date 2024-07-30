import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, Flag, FileStack, WalletCards, CreditCard, Clock } from 'lucide-react';
import PaymentRequiredModal from './Payment';
import './css/Mypage.css';
import NavBar from './Navbar';
import topicCardImage1 from './img/ID.jpg';
import topicCardImage2 from './img/MY.jpg';
import topicCardImage3 from './img/TA.jpg';
import topicCardImage4 from './img/TH.gif';
import topicCardImage5 from './img/VN.jpg';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const countries = [
  { name: "인도네시아", flag: topicCardImage1 },
  { name: "말레이시아", flag: topicCardImage2 },
  { name: "대만", flag: topicCardImage3 },
  { name: "태국", flag: topicCardImage4 },
  { name: "베트남", flag: topicCardImage5 }
];
const MembershipButton = ({ isPremium }) => {
  return (
    <button className={`membership-button ${isPremium ? 'premium' : 'free'}`} disabled>
      {isPremium ? '프리미엄 회원' : '무료 회원'}
    </button>
  );
};
const Mypage = () => {
 
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { changePassword } = useAuth(); 
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState({ used_count: 0, unused_count: 0 });
  const { userName } = useAuth();  // useAuth에서 userName을 가져옵니다.

  // 결제 Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogClick = (logId) => {
    navigate(`/analysis-detail/${logId}`);
  };
  useEffect(() => {


    const fetchActivityLogs = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/user_logs/${userName}`);
        setActivityLogs(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
      }
    };
    const fetchPaymentInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/user_payment_info/${userName}`);
        setPaymentInfo(response.data);
      } catch (error) {
        console.error('Error fetching payment info:', error);
      }
    };
    fetchActivityLogs();
    fetchPaymentInfo();
  }, [userName]);
  const handleNextPage = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setSuccess('비밀번호가 변경 되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(error.response?.data?.detail || '오류가 발생했습니다.');
    }
  };
  const isPremium = paymentInfo.used_count > 0 || paymentInfo.unused_count > 0;
  return (
    <div className="mypage-container">
      <NavBar />
      <div className="mypage-content">
      <div className="logo-container">
          <h1 className="main-main-logo">My Page</h1>
        </div>
        <div className="settings-grid">
          <div className="settings-card">
            <h3><Lock /> 비밀번호 변경</h3>
            <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호"
              required
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 확인"
              required
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <button className='mypage-button' type="submit">비밀번호 변경</button>
          </form>
          </div>

          {/* <div className="settings-card">
            <h3><Flag /> 선호 국가 설정</h3>
            <div className="pre-card">
              <div className="pre-dropdown-content">
                {countries.map((country, index) => (
                  <div
                    key={index}
                    className={`pre-dropdown-item ${selectedCountry?.name === country.name ? 'selected' : ''}`}
                    onClick={() => setSelectedCountry(country)}
                  >
                    <img
                      src={country.flag}
                      alt={country.name}
                      className="pre-flag"
                    />
                    {country.name}
                  </div>
                ))}
              </div>
            </div>
          </div> */}

<div className="settings-card">
          <h3><WalletCards />결제 정보</h3>
          <div className="option">
            <label className="label">
              <CreditCard size={16} />
              <span>회원 상태</span>
            </label>
            <MembershipButton isPremium={isPremium} />
          </div>
          <div className="option">
            <label className="label">
              <Clock size={16} />
              <span>누적 이용 횟수</span>
            </label>
            <span className="info">{paymentInfo.used_count}회</span>
          </div>
          <div className="option">
            <label className="label">
              <Lock size={16} />
              <span>남은 이용권</span>
            </label>
            <span className="info">{paymentInfo.unused_count}개</span>
          </div>
          <div>
            <button className='mypage-button' onClick={handleNextPage}>결제하기</button>
            <PaymentRequiredModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              userName={userName}
            />
          </div>
        </div>
        </div>

        <div className="activity-section">
          <h3><FileStack /> 활동 기록</h3>
          <div className="table-container">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>날짜</th>
                  <th>키워드</th>
                </tr>
              </thead>
              <tbody>
               
                {activityLogs.map((log) => (
                   <tr key={log.id} onClick={() => handleLogClick(log.id)} style={{ cursor: 'pointer' }}>
                    <td>{log.id}</td>
                    <td>{log.date}</td>
                    <td>{log.keyword}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mypage;