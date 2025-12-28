import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import tw from 'twrnc';
import { confirmDelivery, requestOTP } from '../api/deliveryApi';

export default function DeliveryPage({ agent, onLogout, onNavigateHistory }) {
    const [shipmentId, setShipmentId] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

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

    const handleVerify = async () => {
        if (!shipmentId || !otp) {
            Alert.alert('Error', 'Please enter both Shipment ID and OTP.');
            return;
        }

        setLoading(true);
        setStatusMessage('');

        try {
            const result = await confirmDelivery(shipmentId, otp, agent.id); // Use real agent ID

            setStatusMessage('Delivery Confirmed Successfully!');
            Alert.alert('Success', `Shipment ${result.shipment_id} marked as Delivered.`);

            // Reset for next delivery
            setShipmentId('');
            setOtp('');
            setOtpRequested(false);

        } catch (error) {
            console.log(error);
            const msg = error.message || 'Verification Failed';
            setStatusMessage(`Error: ${msg}`);
            Alert.alert('Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={tw`flex-1 p-5 items-center bg-[#023859]`}>
            <View style={tw`w-full flex-row justify-between mb-5 items-center`}>
                <Text style={tw`text-base font-bold text-[#A7EBF2] rounded-full px-2 py-1 bg-[#26658C]`}>👤 {agent?.name}</Text>
                <TouchableOpacity onPress={onNavigateHistory}>
                    <Text style={tw`text-[#A7EBF2] text-base`}> History</Text>
                </TouchableOpacity>
            </View>

            <Text style={tw`text-2xl font-bold mb-8 text-[#54ACBF]`}>Confirm Delivery</Text>

            <View style={tw`w-full mb-4`}>
                <Text style={tw`text-sm mb-1 text-gray-300 font-medium`}>Package ID</Text>
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
                    <Text style={tw`text-sm mb-1 text-gray-300 font-medium`}>Confirmation OTP</Text>
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
                style={tw`p-4 rounded-lg w-full items-center mb-2 ${timer > 0 ? 'bg-gray-400' : 'bg-green-600'}`}
                onPress={handleRequestOTP}
                disabled={loading || timer > 0}
            >
                <Text style={tw`text-white text-lg font-bold`}>
                    {timer > 0 ? `Resend OTP (${timer}s)` : (otpRequested ? 'Resend OTP (Email)' : 'Request OTP (Email)')}
                </Text>
            </TouchableOpacity>

            {/* Verify Button - Only visible if OTP requested */}
            {otpRequested && (
                <TouchableOpacity
                    style={tw`bg-[#011C40] p-4 rounded-lg w-full items-center mt-2`}
                    onPress={handleVerify}
                    disabled={loading}
                >
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

            <TouchableOpacity
                style={tw`bg-transparent mt-5 border border-red-200 p-3 rounded-lg w-full items-center`}
                onPress={onLogout}
            >
                <Text style={tw`text-gray-300 text-base`}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}
