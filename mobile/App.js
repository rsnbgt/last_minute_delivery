import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, FlatList, ScrollView } from 'react-native';
import { confirmDelivery, getAgentHistory, registerAgent, loginAgent, requestOTP } from './api/deliveryApi';
import tw from 'twrnc';

export default function App() {
  const [view, setView] = useState('login'); // 'login', 'register', 'delivery', 'history'

  // Auth State
  const [agent, setAgent] = useState(null); // { id, name, email, mobile }
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  // Delivery State
  const [shipmentId, setShipmentId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [history, setHistory] = useState([]);

  // UI State
  const [otpRequested, setOtpRequested] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- Auth Handlers ---

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter Email/Mobile and Password');
      return;
    }
    setLoading(true);
    try {
      const result = await loginAgent({ identifier: email, password }); // email state holds identifier
      setAgent(result.agent);
      setView('delivery');
      // Clear sensitive fields
      setPassword('');
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || (!email && !mobile) || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await registerAgent({ name, email, mobile, password });
      Alert.alert('Success', 'Registration successful! Please login.');
      setView('login');
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'Could not register');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAgent(null);
    setView('login');
    setHistory([]);
    setShipmentId('');
    setOtp('');
    setStatusMessage('');
  };

  // --- Delivery Handlers ---

  const handleVerify = async () => {
    if (!shipmentId || !otp) {
      Alert.alert('Error', 'Please enter both Shipment ID and OTP.');
      return;
    }

    setLoading(true);
    setStatusMessage('');

    try {
      const result = await confirmDelivery(shipmentId, otp, agent.name); // Use real agent name

      setStatusMessage('Delivery Confirmed Successfully!');
      Alert.alert('Success', `Shipment ${result.shipment_id} marked as Delivered.`);
      setShipmentId('');
      setOtp('');
    } catch (error) {
      console.log(error);
      const msg = error.message || 'Verification Failed';
      setStatusMessage(`Error: ${msg}`);
      Alert.alert('Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async () => {
    setLoading(true);
    try {
      const data = await getAgentHistory(agent.name); // History by name (as per delivery controller)
      setHistory(data);
      setView('history');
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!shipmentId) {
      Alert.alert('Error', 'Please enter Shipment ID');
      return;
    }
    setLoading(true);
    try {
      const res = await requestOTP(shipmentId);
      Alert.alert('Success', res.message); // "OTP generated and sent..."
      console.log("OTP Expiry:", res.otp_expiry);

      // Update UI State
      setOtpRequested(true);
      setTimer(30); // Start 30s countdown
      setStatusMessage(`OTP sent! Resend available in 30s.`);

    } catch (error) {
      Alert.alert('Failed', error.message || 'Could not request OTP');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER FUNCTIONS ---

  const renderLogin = () => (
    <View style={tw`flex-grow justify-center items-center p-5 pt-15`}>
      <Text style={tw`text-2xl font-bold mb-8 text-gray-800`}>Agent Login</Text>

      <View style={tw`w-full mb-4`}>
        <Text style={tw`text-sm mb-1 text-gray-600 font-medium`}>Email or Mobile</Text>
        <TextInput
          style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
          placeholder="Enter Email or Mobile"
          value={email} // reusing email state for identifier
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={tw`w-full mb-4`}>
        <Text style={tw`text-sm mb-1 text-gray-600 font-medium`}>Password</Text>
        <TextInput
          style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={tw`bg-blue-500 p-4 rounded-lg w-full items-center mt-2`} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white text-lg font-bold`}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setView('register')}>
        <Text style={tw`text-blue-500 text-base mt-5 font-medium`}>New Agent? Register Here</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegister = () => (
    <ScrollView contentContainerStyle={tw`flex-grow justify-center items-center p-5 pt-15`}>
      <Text style={tw`text-2xl font-bold mb-8 text-gray-800`}>Register Agent</Text>

      <View style={tw`w-full mb-4`}>
        <Text style={tw`text-sm mb-1 text-gray-600 font-medium`}>Full Name</Text>
        <TextInput
          style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
          placeholder="e.g. James Bond"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={tw`w-full mb-4`}>
        <Text style={tw`text-sm mb-1 text-gray-600 font-medium`}>Email</Text>
        <TextInput
          style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
          placeholder="james@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={tw`w-full mb-4`}>
        <Text style={tw`text-sm mb-1 text-gray-600 font-medium`}>Mobile Number</Text>
        <TextInput
          style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
          placeholder="+1234567890"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
        />
      </View>

      <View style={tw`w-full mb-4`}>
        <Text style={tw`text-sm mb-1 text-gray-600 font-medium`}>Password</Text>
        <TextInput
          style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={tw`bg-blue-500 p-4 rounded-lg w-full items-center mt-2`} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white text-lg font-bold`}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setView('login')}>
        <Text style={tw`text-blue-500 text-base mt-5 font-medium`}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderDelivery = () => (
    <View style={tw`flex-1 p-5 items-center pt-15`}>
      <View style={tw`w-full flex-row justify-between mb-5 items-center`}>
        <Text style={tw`text-base font-bold text-gray-800`}>👤 {agent?.name}</Text>
        <TouchableOpacity onPress={handleViewHistory}>
          <Text style={tw`text-blue-500 text-base`}>View History</Text>
        </TouchableOpacity>
      </View>

      <Text style={tw`text-2xl font-bold mb-8 text-gray-800`}>Confirm Delivery</Text>

      <View style={tw`w-full mb-4`}>
        <Text style={tw`text-sm mb-1 text-gray-600 font-medium`}>Shipment ID</Text>
        <TextInput
          style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
          placeholder="e.g., SHP-1001"
          value={shipmentId}
          onChangeText={setShipmentId}
          autoCapitalize="characters"
        />
      </View>

      {/* Conditionally Show OTP Input */}
      {otpRequested && (
        <View style={tw`w-full mb-4`}>
          <Text style={tw`text-sm mb-1 text-gray-600 font-medium`}>Confirmation OTP</Text>
          <TextInput
            style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
            placeholder="Enter 4-digit OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>
      )}

      {/* Request/Resend Button */}
      <TouchableOpacity
        style={tw`p-4 rounded-lg w-full items-center mb-2 ${timer > 0 ? 'bg-gray-400' : 'bg-green-500'}`}
        onPress={handleRequestOTP}
        disabled={loading || timer > 0}
      >
        <Text style={tw`text-white text-lg font-bold`}>
          {timer > 0 ? `Resend OTP (${timer}s)` : (otpRequested ? 'Resend OTP (Email)' : 'Request OTP (Email)')}
        </Text>
      </TouchableOpacity>

      {/* Verify Button - Only visible if OTP requested */}
      {otpRequested && (
        <TouchableOpacity style={tw`bg-blue-500 p-4 rounded-lg w-full items-center mt-2`} onPress={handleVerify} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white text-lg font-bold`}>VERIFY DELIVERY</Text>
          )}
        </TouchableOpacity>
      )}

      {statusMessage ? (
        <Text style={tw`mt-5 text-base font-medium text-center ${statusMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
          {statusMessage}
        </Text>
      ) : null}

      <TouchableOpacity style={tw`bg-transparent mt-5 border border-gray-400 p-3 rounded-lg w-full items-center`} onPress={handleLogout}>
        <Text style={tw`text-gray-600 text-base`}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHistory = () => (
    <View style={tw`flex-1 p-5 items-center pt-15`}>
      <View style={tw`w-full flex-row justify-between mb-5 items-center`}>
        <TouchableOpacity onPress={() => setView('delivery')}>
          <Text style={tw`text-blue-500 text-base`}>← Back to Delivery</Text>
        </TouchableOpacity>
      </View>
      <Text style={tw`text-2xl font-bold mb-8 text-gray-800`}>Delivery History</Text>

      {history.length === 0 ? (
        <Text style={tw`text-gray-400 text-base mt-12`}>No deliveries yet.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.shipment_id}
          renderItem={({ item }) => (
            <View style={tw`bg-white p-4 rounded-lg mb-2 border-l-4 border-green-500 shadow-sm w-full`}>
              <Text style={tw`text-lg font-bold text-gray-800`}>{item.shipment_id}</Text>
              <Text style={tw`text-gray-600 mt-1`}>{new Date(item.delivered_at).toLocaleString()}</Text>
              <Text style={tw`self-start bg-green-100 text-green-700 px-2 py-1 rounded mt-2 text-xs font-bold`}>{item.status}</Text>
            </View>
          )}
          style={tw`w-full`}
        />
      )}
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-100`}>
      {view === 'login' && renderLogin()}
      {view === 'register' && renderRegister()}
      {view === 'delivery' && renderDelivery()}
      {view === 'history' && renderHistory()}
    </View>
  );
}
