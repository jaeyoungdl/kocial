import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Main from './Main';
import Login from './Login';
import './App.css';
import Join from './Join';
import Mypage from './Mypage';
import Possibility from './Possibility';
import Trend from './Trend';
import Payment from './Payment';
import Start from './Start';
import TimeSeriesChart from './TimeSeriesChart';
import SortedBarChart from './SortedBarChart';
import AnalysisDetail from './AnalysisDetail';
function App() {
  return (
    <AuthProvider>
    <div className="App">
      <Routes>
        <Route path="/" element={<Start/>} />
        <Route path="/Main" element={<Main />} />
        <Route path="/Payment" element={<Payment/>} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Join" element={<Join />} />
        <Route path="/Mypage" element={<Mypage />} />
        <Route path="/Possibility" element={<Possibility />} />
        <Route path="/Trend/:country" element={<Trend />} />
        <Route path="/TimeSeriesChart" element={<TimeSeriesChart />} />
        <Route path="/SortedBarChart" element={<SortedBarChart />} />
        <Route path="/analysis-detail/:logId" element={<AnalysisDetail />} />
      </Routes>
    </div>
    </AuthProvider>
  );
}

export default App;