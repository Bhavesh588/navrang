import { View, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

export default function DepartmentScreen() {
  const { id } = useLocalSearchParams()

  return (
    <View>
      <Text>Department {id}</Text>
    </View>
  )
}
