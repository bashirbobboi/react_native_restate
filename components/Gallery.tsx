import { View, FlatList, Image, Dimensions, TouchableOpacity, StatusBar } from 'react-native'
import React from 'react'
import { galleryImages } from '@/lib/data'
import { router } from 'expo-router'
import icons from '@/constants/icons'

const Gallery = () => {
  const { width, height } = Dimensions.get('window');

  return (
    <View className="relative bg-black">
      {/* make image go under status bar */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Overlay header */}
      <View className="absolute top-20 left-0 right-0 z-10 flex flex-row items-center justify-between px-5">
        <TouchableOpacity onPress={() => router.back()} className="size-11 items-center justify-center rounded-full">
          <Image source={icons.backArrow} className="size-7" />
        </TouchableOpacity>
        <View className='flex flex-row'>
            <TouchableOpacity className="size-11 items-center justify-center rounded-full">
            <Image source={icons.heart} className="size-7" />
            </TouchableOpacity>
            <TouchableOpacity className="size-11 items-center justify-center rounded-full">
            <Image source={icons.send} className="size-7" />
            </TouchableOpacity>
        </View>
        
      </View>

      {/* Image carousel */}
      <FlatList
        data={galleryImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{ width, height: height * 0.45 }}
            className="w-full"
            resizeMode="cover"
          />
        )}
      />
    </View>
  )
}

export default Gallery
