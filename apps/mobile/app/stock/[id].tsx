import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useStocks } from '@navrang/core'
import { colors } from '@/ui/theme'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function StockDetailScreen() {
  const { id } = useLocalSearchParams()
  const { data } = useStocks()

  const router = useRouter()

  const numericId =
  typeof id === "string"
    ? parseInt(id, 10)
    : Array.isArray(id)
    ? parseInt(id[0], 10)
    : undefined
  
  const stock = data?.find((s: any) => s.id === numericId)

  if (!stock) {
    return <Text>Stock not found</Text>
  }

  return (
    <SafeAreaView style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', height: '100%', padding: 16 }}>
      <View style={{ overflow: 'scroll' }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>
          {stock.name}
        </Text>
        <Text>Quantity: {stock.current_quantity}</Text>
        <Text>Category: {stock.category_name}</Text>
        <Text>Department: {stock.department_name}</Text>
      </View>
      {/* Actions */}
      <View style={{ alignItems: 'flex-end' }}>
        <Pressable
          style={styles.button}
          onPress={() => router.push({
            pathname: '/stocks/manage', 
            params: { stockId: numericId }
          })}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
        {/* <Pressable
          style={styles.button2}
          onPress={() => router.push('/stocks/manage')}
        >
          <Text style={styles.buttonText}>-</Text>
        </Pressable> */}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.buttonBGColor,
    borderRadius: 28,
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button2: {
    backgroundColor: '#b00020',
    borderRadius: 28,
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.buttonTextColor,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 20,
  },
})
