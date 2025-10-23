import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import images from '@/constants/images' 
import icons from '@/constants/icons'

const SignIn = () => {
  const handleLogin = () => {}; 
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
          <TouchableOpacity onPress={handleLogin} className='bg-white shadow-md shadow-zinc-300 rounded-full w-full mt-5 py-4'>
            <View className='flex flex-row items-center justify-center'>
              <Image 
                source={icons.google} 
                className='w-5 h-5' 
                resizeMode='contain'
              />
              <Text className='text-lg font-rubik-medium text-black-300 ml-2'>Continue with Google</Text>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn