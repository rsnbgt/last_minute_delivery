import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

export default function Navbar() {
    return (
        <SafeAreaView edges={['top']} style={tw`bg-[#011C40] rounded-b-2rem `}>
            <StatusBar barStyle="dark-content" backgroundColor="#023859" />
            <View style={tw`h-16 justify-center items-center`}>
                <Text style={tw`text-lg font-bold text-gray-200 tracking-wider`}>LAST MILE DELIVERY</Text>
            </View>
        </SafeAreaView>
    );
}
