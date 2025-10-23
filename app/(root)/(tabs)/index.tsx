import { Text, View, Image, TouchableOpacity, FlatList, Button } from "react-native";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import icons from "@/constants/icons";
import Search from "@/components/Search";
import { FeaturedCard, Card } from "@/components/Cards";
import Filters from "@/components/Filters";
import { useGlobalContext } from "@/lib/global-provider";
import { router, useLocalSearchParams } from "expo-router";
import { getLatestProperties, getProperties } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";

export default function Index() {
  const {user}= useGlobalContext();
  const params = useLocalSearchParams<{ query?: string; filter?: string; }>();

  const {data: latestProperties, loading: latestPropertiesLoading} = useAppwrite({
        fn: getLatestProperties
      });

  const {data: properties, loading, refetch} = useAppwrite({
    fn: getProperties,
    params: {
      filter: params.filter!,
      query: params.query!,
      limit: 6
    },
    skip: true,
  })

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);
  
  useEffect(() => {
    refetch({
      filter: params.filter!,
      query: params.query!,
      limit: 6
    })


  }, [params.filter, params.query])


  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
          data= {properties}
          renderItem={({item}) => <Card item={item} onPress={() => handleCardPress(item.$id)} />}
          keyExtractor={(item) => item.$id}
          numColumns={2}
          contentContainerClassName="pb-32"
          columnWrapperClassName="flex px-5 gap-5"
          ListHeaderComponent={ 
            <View className="px-5">
              <View className="flex flex-row items-center justify-between mt-5">
                <View className="flex flex-row items-center">
                  <Image source= {{uri: user?.avatar}} className="size-12 rounded-full" />
                  <View className="flex flex-col item-start ml-2 justify-center">
                    <Text className="text-xs font-rubik text-black-100">Good Morning</Text>
                    <Text className="text-base font-rubik-medium text-black-300">{user?.name}</Text>
                  </View>
                </View>
                <Image source={icons.bell} className="size-6" />
              </View>
            
            <Search />
            <View className="my-5">
              <View className="flex flex-row items-center justify-between">
                <Text className="text-xl font-rubik-bold text-black-300">Featured</Text>
                <TouchableOpacity>
                  <Text className="text-base font-rubik-bold text-primary-300">See All</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                  data= {latestProperties}
                  renderItem={({item}) => <FeaturedCard item={item} onPress={() => handleCardPress(item.$id)} />}
                  keyExtractor={(item) => item.$id}
                  horizontal
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="flex gap-5 mt-5"
              />
              </View>

              <View className="flex flex-row items-center justify-between">
                <Text className="text-xl font-rubik-bold text-black-300">Our Recommendation</Text>
                <TouchableOpacity>
                  <Text className="text-base font-rubik-bold text-primary-300">See All</Text>
                </TouchableOpacity>
              </View>

              <Filters />

            </View>
          }
      />
    </SafeAreaView>
  );
}
