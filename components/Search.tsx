import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { usePathname, useLocalSearchParams } from 'expo-router';

const Search = () => {
    const path = usePathname();
    const params = useLocalSearchParams<{ query: string }>() ;
    const [search, setSearch] = useState(params.query);

    const handleSearch = (text: string) => {
        setSearch(text);
    }
    
  return (
    <View>
      <Text>Search</Text>
    </View>
  )
}

export default Search