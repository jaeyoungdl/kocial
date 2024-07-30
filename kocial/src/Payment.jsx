import React, { useEffect } from 'react';
import './css/Payment.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Payment = ({ isOpen, onClose, userName }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.iamport.kr/js/iamport.payment-1.2.0.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!window.IMP) return;
    const { IMP } = window;
    IMP.init('imp14761077'); // 가맹점 식별코드

    IMP.request_pay({
      pg: 'html5_inicis',
      pay_method: 'card',
      merchant_uid: `mid_${new Date().getTime()}`,
      amount: 1,
      name: 'KOCIAL 정밀분석 이용권',
      buyer_name: userName,
      buyer_tel: '01012341234',
      buyer_email: 'example@example.com',
    }, async (rsp) => {
      if (rsp.success) {
        console.log('결제 성공', rsp);
        try {
          const paymentData = {
            u_id: userName,
            amount: rsp.paid_amount,
          };
          console.log('Sending payment data:', paymentData);
          
          const response = await axios.post('http://localhost:8000/save_payment', paymentData, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          console.log('Server response:', response.data);
          alert('결제가 성공적으로 완료되었습니다.');
          onClose();
          navigate('/mypage');
        } catch (error) {
          console.error('Error saving payment:', error);
          console.error('Error response:', error.response);
          alert('결제는 성공했지만 정보 저장 중 오류가 발생했습니다.');
          navigate('/mypage');
        }
      } else {
        console.log('결제 실패', rsp);
        alert('결제에 실패했습니다. 다시 시도해주세요.');
        onClose();
        navigate('/mypage');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modalStyle">
      <div className="contentStyle">
        <h2 className="titleStyle">결제가 필요합니다</h2>
        <p className="descriptionStyle">다음 페이지로 넘어가려면 결제해주세요!</p>
        <button
          className="buttonStyle"
          onClick={handlePayment}
        >
          결제하기
        </button>
      </div>
    </div>
  );
};

export default Payment;