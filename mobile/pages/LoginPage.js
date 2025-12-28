import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import tw from 'twrnc';
import { loginAgent } from '../api/deliveryApi';

export default function LoginPage({ onLogin, onNavigateRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter Email/Mobile and Password');
            return;
        }
        setLoading(true);
        try {
            const result = await loginAgent({ identifier: email, password });
            onLogin(result.agent);
        } catch (error) {
            Alert.alert('Login Failed', error.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={tw`flex-grow justify-center items-center p-5 bg-[#023859]`}>
            <Text style={tw`text-2xl font-bold mb-8 text-[#A7EBF2]`}>LOGIN</Text>

            <View style={tw`w-full mb-4`}>
                <Text style={tw`text-sm mb-1 text-gray-300 font-medium`}>Email or Mobile</Text>
                <TextInput
                    style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
                    placeholder="Enter Email or Mobile"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
            </View>

            <View style={tw`w-full mb-4`}>
                <Text style={tw`text-sm mb-1 text-gray-300 font-medium`}>Password</Text>
                <TextInput
                    style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
                    placeholder="Enter Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity
                style={tw`bg-[#011C40] p-4 rounded-lg w-full items-center mt-2`}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#A7EBF2" />
                ) : (
                    <Text style={tw`text-[#A7EBF2] text-lg font-bold`}>Login</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onNavigateRegister}>
                <Text style={tw`text-[#A7EBF2] text-base mt-5 font-medium p-2 rounded-lg`}>Register</Text>
            </TouchableOpacity>
        </View>
    );
}
