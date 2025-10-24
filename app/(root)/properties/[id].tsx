import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { useAppwrite } from '@/lib/useAppwrite'
import { getProperty } from '@/lib/appwrite'
import { SafeAreaView } from 'react-native-safe-area-context'
import icons from '@/constants/icons'

const Property = () => {
    const { id } = useLocalSearchParams();


    const {data: property, loading, refetch} = useAppwrite({
        fn: getProperty,
        params: {
            id: id as string
        },
        skip: true,
    })

  return (
    <SafeAreaView>
      <View className="flex flex-row items-center justify-between mt-5 px-5">
                <TouchableOpacity onPress={() => router.back()} className="flex flex-row size-11 items-center justify-center">
                  <Image source={icons.backArrow} className="size-5" />
                </TouchableOpacity>
                <Image source={icons.bell} className="w-6 h-6" />
      </View>
      <View className='pl-6 mt-5'>
        <Text className='text-3xl font-rubik-bold'>
          Modernica Apartment
        </Text>
        <View className='flex flex-row gap-5 mt-6 '>
          <Text className='text-primary-300 bg-primary-200 rounded-full font-bold px-2 py-1'> Apartment </Text>
          <View className='flex flex-row px-2 py-1'>  
            <Image source={icons.star} className='size-5' />
            <Text className='font-semibold text-black-200'> 4.8 (1,275 reviews) </Text>
          </View>   
        </View>
        <View className='flex flex-row justify-content gap-2 mt-6 pl-4'>
          <View className='flex flex-row gap-2'>
            <View className='flex flex-row bg-primary-100 rounded-full size-11 items-center justify-center'>
              <Image source={icons.bed} className='size-5' />
            </View>
            <Text className='font-semibold py-3'> 8 Beds </Text>
          </View>
          <View className='flex flex-row gap-2'>
            <View className='flex flex-row bg-primary-100 rounded-full size-11 items-center justify-center'>
              <Image source={icons.bath} className='size-5' />
            </View>
            <Text className='font-semibold py-3'> 3 Baths </Text>
          </View>
          <View className='flex flex-row gap-2'>
            <View className='flex flex-row bg-primary-100 rounded-full size-11 items-center justify-center'>
              <Image source={icons.area} className='size-5' />
            </View>
            <Text className='font-semibold py-3'> 2000 sqft </Text>
          </View>
        </View>
        <View className="h-px bg-gray-200 my-2" />
        <View className='mt-6'>
        <Text className='text-2xl font-rubik-bold'>Agent</Text>
      </View>
      </View>
    </SafeAreaView>
  )
}

export default Property