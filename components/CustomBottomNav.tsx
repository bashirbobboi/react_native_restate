import icons from '@/constants/icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const TabIcon = ({focused, icon, title}: {focused: boolean, icon: any, title: string}) => (
    <View className="flex-1 mt-3 flex flex-col items-center">
        <Image source={icon} tintColor={focused ? '#0061FF' : '#666876'} resizeMode='contain' className='size-6' />
        <Text className={`${focused ? 'text-primary-300 font-rubik-medium' : 'text-black-100 font-rubik'} text-xs w-full text-center mt-1`}>{title}</Text>
    </View>
)

const CustomBottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { 
      icon: icons.home, 
      label: 'Home', 
      route: '/(tabs)/',
      isActive: pathname === '/(tabs)/' || pathname === '/'
    },
    { 
      icon: icons.search, 
      label: 'Explore', 
      route: '/(tabs)/explore',
      isActive: pathname === '/(tabs)/explore'
    },
    { 
      icon: icons.person, 
      label: 'Profile', 
      route: '/(tabs)/profile',
      isActive: pathname === '/(tabs)/profile'
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  return (
    <View 
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-primary-200"
      style={{
        minHeight: 70,
        borderTopColor: '#0061FF1A',
      }}
    >
      <View className="flex-row justify-around">
        {navItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleNavigation(item.route)}
            className="flex-1 items-center"
            activeOpacity={0.7}
          >
            <TabIcon 
              icon={item.icon} 
              focused={item.isActive} 
              title={item.label} 
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default CustomBottomNav;
