import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const TabIcon = ({focused, icon, title}: {focused: boolean, icon: any, title: string}) => (
    <View className="flex-1 mt-3 flex flex-col items-center">
        <Image source={icon} tintColor={focused ? '#0061FF' : '#666876'} resizeMode='contain' className='size-6' />
        <Text className={`${focused ? 'text-primary-300 font-rubik-medium' : 'text-black-100 font-rubik'} text-xs w-full text-center mt-1`}>{title}</Text>
    </View>
)

interface CustomBottomNavProps {
  property?: any; // Accept any property object from Appwrite
}

const CustomBottomNav = ({ property }: CustomBottomNavProps) => {

  return (
    <View 
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-primary-200"
      style={{
        minHeight: 90,
        borderTopColor: '#0061FF1A',
      }}
    >
       <View className="flex flex-row justify-between px-5 pt-5">
         <View className="flex flex-col pl-5">
           <Text className="text-sm font-rubik-medium text-black-200"> Price </Text>
           <Text className="text-2xl font-rubik-bold text-primary-300">
             {property?.currency || '$'}{property?.price || property?.cost || property?.amount || property?.listing_price || property?.sale_price ? 
               (property?.price || property?.cost || property?.amount || property?.listing_price || property?.sale_price).toLocaleString() : '0'}
           </Text>
         </View>
         <TouchableOpacity className="bg-primary-300 rounded-full w-64 px-4 py-2 items-center justify-center">
           <Text className="text-xl font-rubik-bold text-white"> Book Now </Text>
         </TouchableOpacity>
         
       </View>
    </View>
  );
};

export default CustomBottomNav;
