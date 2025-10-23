import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import images from '@/constants/images' 

const SignIn = () => {
  return (
    <SafeAreaView className='bg-white h-full'>
      <ScrollView contentContainerClassName='h-full'>
        <Image source= {images.onboarding} className="w-full h-4/6" resizeMode="contain"/>
        <View className='px-10'>
          <Text className='text-base text-black-200 text-center uppercase font-rubik'>Welcome to ReState</Text>
          <Text className='text-3xl text-black-300 text-center font-rubik-bold mt-2 capitalize'>
            Let's get you closer to {"\n"}
            <Text className='text-primary-300'>
              Your Ideal home
            </Text>
          </Text>
          <Text className='text-black-200 text-lg font-rubik text-center mt-12'>
            Login to ReState with Google
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn