import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import tw from 'twrnc';
import { getAgentHistory } from '../api/deliveryApi';

export default function HistoryPage({ agent, onBack }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await getAgentHistory(agent.id); // History by ID
            setHistory(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={tw`flex-1 p-5 items-center pt-15 bg-[#023859]`}>
            <View style={tw`w-full flex-row justify-between mb-5 items-center`}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={tw`text-[#54ACBF] text-base`}>← Back to Delivery</Text>
                </TouchableOpacity>
            </View>
            <Text style={tw`text-2xl font-bold mb-8 text-[#A7EBF2]`}>History</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : history.length === 0 ? (
                <Text style={tw`text-gray-400 text-base mt-12`}>No deliveries yet.</Text>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.shipment_id}
                    renderItem={({ item }) => (
                        <View style={tw`bg-[#011C40] p-4 rounded-lg mb-2 border-l-4 border-green-500 shadow-sm w-full`}>
                            <Text style={tw`text-lg font-bold text-gray-100`}>{item.shipment_id}</Text>
                            <Text style={tw`text-gray-300 mt-1`}>{new Date(item.delivered_at).toLocaleString()}</Text>
                            <Text style={tw`self-start bg-green-100 text-green-700 px-2 py-1 rounded mt-2 text-xs font-bold`}>{item.status}</Text>
                        </View>
                    )}
                    style={tw`w-full`}
                />
            )}
        </View>
    );
}
