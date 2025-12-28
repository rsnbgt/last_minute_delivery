import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import tw from 'twrnc';
import { registerAgent } from '../api/deliveryApi';

export default function RegisterPage({ onNavigateLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || (!email && !mobile) || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        setLoading(true);
        try {
            await registerAgent({ name, email, mobile, password });
            Alert.alert('Success', 'Registration successful! Please login.');
            onNavigateLogin();
        } catch (error) {
            Alert.alert('Registration Failed', error.message || 'Could not register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={tw`flex-grow justify-center items-center p-5 bg-[#023859]`}>
            <Text style={tw`text-2xl font-bold mb-8 text-[#A7EBF2]`}>REGISTER</Text>

            <View style={tw`w-full mb-4`}>
                <Text style={tw`text-sm mb-1 text-gray-300 font-medium`}>Full Name</Text>
                <TextInput
                    style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
                    placeholder="e.g. Manas"
                    value={name}
                    onChangeText={setName}
                />
            </View>

            <View style={tw`w-full mb-4`}>
                <Text style={tw`text-sm mb-1 text-gray-300 font-medium`}>Email</Text>
                <TextInput
                    style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
                    placeholder="e.g. manas123@gmail.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <View style={tw`w-full mb-4`}>
                <Text style={tw`text-sm mb-1 text-gray-300 font-medium`}>Mobile Number</Text>
                <TextInput
                    style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
                    placeholder="+91 1234567890"
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                />
            </View>

            <View style={tw`w-full mb-4`}>
                <Text style={tw`text-sm mb-1 text-gray-300 font-medium`}>Password</Text>
                <TextInput
                    style={tw`bg-white p-4 rounded-lg text-base border border-gray-200 w-full`}
                    placeholder="mypassword@_12"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity
                style={tw`bg-[#011C40] p-4 rounded-lg w-full items-center mt-2`}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={tw`text-[#54ACBF] text-lg font-bold`}>Register</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onNavigateLogin}>
                <Text style={tw`text-[#54ACBF] text-base mt-5 font-medium`}>Login</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
