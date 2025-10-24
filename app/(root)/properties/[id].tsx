import { ImageCard } from "@/components/Cards"
import CustomBottomNav from '@/components/CustomBottomNav'
import Gallery from '@/components/Gallery'
import icons from '@/constants/icons'
import images from '@/constants/images'
import { getProperty } from '@/lib/appwrite'
import { useAppwrite } from '@/lib/useAppwrite'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Dimensions, FlatList, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const Property = () => {
    const { id } = useLocalSearchParams();

    const { height } = Dimensions.get('window');

    const {data: property, loading, refetch} = useAppwrite({
        fn: getProperty,
        params: {
            id: id as string
        },
        // Remove skip: true to fetch automatically
    })

    // Use property images if available, otherwise fallback to default images
    const galleryImages = property && property.images && property.images.length > 0 
      ? property.images.map((img: string, index: number) => ({ id: index.toString(), img: { uri: img } }))
      : [
          { id: "1", img: images.japan },
          { id: "2", img: images.map },
          { id: "3", img: images.newYork },
        ];

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!property) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Property not found</Text>
            </View>
        );
    }


  return (
    <View className="flex-1 bg-white">
      <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 100 }}>
        <Gallery />

        <View className='pl-6 pr-6 mt-5'>
        <Text className='text-3xl font-rubik-bold'>
          {property.name || 'Property Name'}
        </Text>
        <View className='flex flex-row gap-5 mt-6 '>
          <Text className='text-primary-300 bg-primary-200 rounded-full font-bold px-2 py-1'>
            {property.type || 'Property Type'}
          </Text>
          <View className='flex flex-row px-2 py-1'>  
            <Image source={icons.star} className='size-5' />
            <Text className='font-bold text-black-200'>
              {property.rating || 0} ({property.reviews?.length || 0} reviews)
            </Text>
          </View>   
        </View>
        <View className='flex flex-row justify-content gap-2 mt-6'>
          <View className='flex flex-row gap-2'>
            <View className='flex flex-row bg-primary-100 rounded-full size-11 items-center justify-center'>
              <Image source={icons.bed} className='size-5' />
            </View>
            <Text className='font-semibold py-3'> 
              {property.bedrooms || 0} Beds 
            </Text>
          </View>
          <View className='flex flex-row gap-2'>
            <View className='flex flex-row bg-primary-100 rounded-full size-11 items-center justify-center'>
              <Image source={icons.bath} className='size-5' />
            </View>
            <Text className='font-semibold py-3'> 
              {property.bathrooms || 0} Baths 
            </Text>
          </View>
          <View className='flex flex-row gap-2'>
            <View className='flex flex-row bg-primary-100 rounded-full size-11 items-center justify-center'>
              <Image source={icons.area} className='size-5' />
            </View>
            <Text className='font-semibold py-3'> 
              {property.area || 0} sqft 
            </Text>
          </View>
        </View>
        <View className="h-px bg-primary-200 my-10" />
        <View>
          <Text className='text-2xl font-rubik-bold'>Agent</Text>
          <View className='flex flex-row mt-3 items-center justify-between'>
            <View className='flex flex-row items-center'>
              <Image 
                source={property.agent?.avatar ? { uri: property.agent.avatar } : images.avatar} 
                className='w-20 h-20' 
              />
              <View className='pl-4'>
                <Text className='text-xl font-rubik-semibold text-black-300'>
                  {property.agent?.name || 'Agent Name'}
                </Text>
                <Text className='font-rubik-medium text-black-200 mt-1'>
                  {property.agent?.role || 'Agent'}
                </Text>
              </View>
            </View>

            <View className='flex flex-row gap-5'>
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${property.agent?.email || 'agent@example.com'}`)}>
                <Image source={icons.chat} className='w-8 h-8' />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${property.agent?.phone || '+1234567890'}`)}>
                <Image source={icons.phone} className='w-8 h-8' />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className='mt-10'>
          <Text className='text-2xl font-rubik-bold'>Overview</Text>
          <View className=' mt-5'>
            <Text className='text-xl leading-relaxed text-black-200 font-rubik'>
              {property.description || 'No description available for this property.'}
            </Text>
          </View>
        </View>

        <View className='mt-10'>
          <Text className='text-2xl font-rubik-bold'>
            Facilities
          </Text>
          <View className='flex flex-row flex-wrap mt-5 gap-5'>
            {property.facilities && property.facilities.length > 0 ? (
              property.facilities.map((facility: string, index: number) => (
                <View key={index} className='flex flex-col gap-3'>
                  <View className='bg-primary-100 rounded-full size-20 items-center justify-center'>
                    <Image source={icons.wifi} className='size-9' />
                  </View>
                  <Text numberOfLines={1} className='truncate w-20 text-center'>
                    {facility}
                  </Text>
                </View>
              ))
            ) : (
              // Fallback to default facilities if none provided
              <>
                <View className='flex flex-col gap-3'>
                  <View className='bg-primary-100 rounded-full size-20 items-center justify-center'>
                    <Image source={icons.carPark} className='size-9' />
                  </View>
                  <Text>Car Parking</Text>
                </View>
                <View className='flex flex-col gap-3'>
                  <View className='bg-primary-100 rounded-full size-20 items-center justify-center'>
                    <Image source={icons.wifi} className='size-9' />
                  </View>
                  <Text numberOfLines={1} className='truncate w-20' >Wifi & Network</Text>
                </View>
                <View className='flex flex-col gap-3'>
                  <View className='bg-primary-100 rounded-full size-20 items-center justify-center'>
                    <Image source={icons.swim} className='size-9' />
                  </View>
                  <Text numberOfLines={1} className='truncate w-20' >Swimming Pool</Text>
                </View>
                <View className='flex flex-col gap-3'>
                  <View className='bg-primary-100 rounded-full size-20 items-center justify-center'>
                    <Image source={icons.dumbell} className='size-9' />
                  </View>
                  <Text numberOfLines={1} className='truncate w-20' >Gym & Fitness</Text>
                </View>
              </>
            )}
          </View>
        </View>
        <View className='mt-10'>
          <Text className='text-2xl font-rubik-bold'>
            Gallery
          </Text>

          <FlatList
                  data= {galleryImages.slice(0, 3)}
                  renderItem={({item}) => <ImageCard item={item}/>}
                  keyExtractor={(item) => item.id}
                  horizontal
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="flex gap-5 mt-5"
            />
        </View>
        <View className='mt-10 py-5'>
          <Text className='text-2xl font-rubik-bold'>Location</Text>
          <View className=' flex flex-row items-center gap-2 mt-5'>
            <Image source={icons.location} className='size-6'/> 
            <Text className='text-base text-black-200 font-rubik-semibold'>
              {property.address || 'Address not available'}
            </Text>
          </View>
          <View className='mt-5'>
            <Image 
              source={property.mapImage ? { uri: property.mapImage } : images.map} 
              style={{ height: height * 0.20 }} 
              className='w-full rounded-2xl' 
            />
          </View>
        </View>
        <View className='pb-20 pt-5'>
          <View className='flex flex-row items-center justify-between'>
            <View className='flex flex-row gap-5 items-center'>
              <Image source={icons.star} className='size-8' />
              <Text className='text-2xl font-rubik-bold'>
                {property.rating || 0} ({property.reviews?.length || 0} reviews)
              </Text>
            </View>
            <Text className='font-rubik-semibold text-primary-300'>See All</Text>
          </View>
          
          {property.reviews && property.reviews.length > 0 ? (
            property.reviews.slice(0, 1).map((review: any, index: number) => (
              <View key={index} className='flex mt-3'>
                <View className='flex flex-row items-center mt-5'>
                  <Image 
                    source={review.user?.avatar || review.avatar || review.user_avatar ? 
                      { uri: review.user?.avatar || review.avatar || review.user_avatar } : images.avatar} 
                    className='w-14 h-14' 
                  />
                  <View className='pl-4'>
                    <Text className='text-xl font-rubik-semibold text-black-300'>
                      {review.user?.name || review.name || review.user_name || review.author || 'Anonymous'}
                    </Text>
                  </View>
                </View>
                <View className='mt-5'>
                  <Text>{review.comment || review.text || review.content || review.message || review.description || 'No comment available'}</Text>
                </View>
                <View className='flex flex-row justify-between mt-5'>
                  <View className='flex flex-row items-center gap-2'>
                    <Image source={icons.star} className='size-5' />  
                    <Text className='font-rubik-semibold'>{review.rating || review.score || review.stars || 0}</Text>
                  </View>
                  <Text className='font-rubik text-black-100'>
                    {review.date || review.created_at || review.timestamp || review.posted_at || 'Recently'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View className='flex mt-3'>
              <View className='flex flex-row items-center mt-5'>
                <Image source={images.avatar} className='w-14 h-14' />
                <View className='pl-4'>
                  <Text className='text-xl font-rubik-semibold text-black-300'>No reviews yet</Text>
                </View>
              </View>
              <View className='mt-5'>
                <Text>Be the first to review this property!</Text>
              </View>
            </View>
          )}
        </View>
        </View>
      </ScrollView>
      <CustomBottomNav property={property} />
    </View>
  )
}

export default Property