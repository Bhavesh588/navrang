import { View, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

export default function CategoryScreen() {
  const { id } = useLocalSearchParams()

  return (
    <View>
      <Text>Category {id}</Text>
    </View>
  )
}
