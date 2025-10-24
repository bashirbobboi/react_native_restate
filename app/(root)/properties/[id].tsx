import Gallery from '@/components/Gallery'
import icons from '@/constants/icons'
import images from '@/constants/images'
import { getProperty } from '@/lib/appwrite'
import { useAppwrite } from '@/lib/useAppwrite'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native'

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
    <ScrollView>
      <Gallery />

      <View className='pl-6 pr-6 mt-5'>
        <Text className='text-3xl font-rubik-bold'>
          Modernica Apartment
        </Text>
        <View className='flex flex-row gap-5 mt-6 '>
          <Text className='text-primary-300 bg-primary-200 rounded-full font-bold px-2 py-1'> Apartment </Text>
          <View className='flex flex-row px-2 py-1'>  
            <Image source={icons.star} className='size-5' />
            <Text className='font-bold text-black-200'> 4.8 (1,275 reviews) </Text>
          </View>   
        </View>
        <View className='flex flex-row justify-content gap-2 mt-6'>
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
        <View className="h-px bg-primary-200 my-10" />
        <View>
          <Text className='text-2xl font-rubik-bold'>Agent</Text>
          <View className='flex flex-row mt-3 items-center justify-between'>
            <View className='flex flex-row items-center'>
              <Image source={images.avatar} className='w-20 h-20' />
              <View className='pl-4'>
                <Text className='text-xl font-rubik-semibold text-black-300'>Natasya Wilodra</Text>
                <Text className='font-rubik-medium text-black-200 mt-1'>Owner</Text>
              </View>
            </View>

            <View className='flex flex-row gap-5'>
              <TouchableOpacity onPress={() => Linking.openURL("mailto:johndoe@gmail.com")}>
                <Image source={icons.chat} className='w-8 h-8' />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL("tel:+1234567890")}>
                <Image source={icons.phone} className='w-8 h-8' />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className='mt-10'>
          <Text className='text-2xl font-rubik-bold'>Overview</Text>
          <View className=' mt-5'>
            <Text className='text-xl leading-relaxed text-black-200 font-rubik'>
            Sleek, modern 2-bedroom apartment with open living space, 
            high-end finishes, and city views. Minutes from downtown, 
            dining, and transit.
            </Text>
          </View>
        </View>

        <View className='mt-10'>
          <Text className='text-2xl font-rubik-bold'>
            Facilities
          </Text>
        </View>
        <View className='mt-10'>
          <Text className='text-2xl font-rubik-bold'>
            Gallery
          </Text>
        </View>
        <View className='mt-10'>
          <Text className='text-2xl font-rubik-bold'>
            Location
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default Property