import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';

function Charts({ data }) {
  // Default mock data if no data provided
  const revenueData = data?.revenue || [
    { month: 'Jan', revenue: 40000, expenses: 24000 },
    { month: 'Feb', revenue: 45000, expenses: 25000 },
    { month: 'Mar', revenue: 50000, expenses: 28000 },
    { month: 'Apr', revenue: 48000, expenses: 26000 },
    { month: 'May', revenue: 55000, expenses: 30000 },
    { month: 'Jun', revenue: 60000, expenses: 32000 }
  ];

  const appointmentData = data?.appointments || [
    { name: 'Completed', value: 450 },
    { name: 'Pending', value: 120 },
    { name: 'Cancelled', value: 30 }
  ];

  const patientData = data?.patients || [
    { month: 'Jan', new: 65 },
    { month: 'Feb', new: 75 },
    { month: 'Mar', new: 85 },
    { month: 'Apr', new: 70 },
    { month: 'May', new: 90 },
    { month: 'Jun', new: 95 }
  ];

  const COLORS = ['#4CAF50', '#FF9800', '#f44336', '#2196F3', '#9C27B0'];

  const formatCurrency = (value) => `₹${value.toLocaleString()}`;

  return (
    <motion.div 
      className="charts-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '20px',
        padding: '20px 0'
      }}
    >
      {/* Revenue Chart */}
      <motion.div 
        className="chart-card"
        whileHover={{ y: -5 }}
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Revenue Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" tickFormatter={formatCurrency} />
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                background: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#4CAF50" 
              strokeWidth={2}
              dot={{ fill: '#4CAF50' }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#f44336" 
              strokeWidth={2}
              dot={{ fill: '#f44336' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Appointments Chart */}
      <motion.div 
        className="chart-card"
        whileHover={{ y: -5 }}
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Appointment Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={appointmentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {appointmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px',
          marginTop: '10px'
        }}>
          {appointmentData.map((item, index) => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: COLORS[index % COLORS.length] 
              }} />
              <span style={{ fontSize: '12px', color: '#666' }}>{item.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* New Patients Chart */}
      <motion.div 
        className="chart-card"
        whileHover={{ y: -5 }}
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          gridColumn: 'span 2'
        }}
      >
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>New Patients</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={patientData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip />
            <Bar dataKey="new" fill="#2196F3" radius={[5, 5, 0, 0]}>
              {patientData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="summary-card"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white'
        }}
      >
        <h4 style={{ margin: '0 0 10px 0', opacity: 0.9 }}>Total Revenue</h4>
        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>
          ₹{revenueData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
        </p>
        <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '14px' }}>
          ↑ 12% from last month
        </p>
      </motion.div>

      <motion.div 
        className="summary-card"
        style={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white'
        }}
      >
        <h4 style={{ margin: '0 0 10px 0', opacity: 0.9 }}>Total Appointments</h4>
        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>
          {appointmentData.reduce((sum, item) => sum + item.value, 0)}
        </p>
        <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '14px' }}>
          {appointmentData[0]?.value} completed
        </p>
      </motion.div>
    </motion.div>
  );
}

export default Charts;