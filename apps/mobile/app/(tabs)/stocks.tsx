import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { getUserStocks, useStocks, useUserStocks } from '@navrang/core'
import { colors, spacing } from '@/ui/theme'
import { Screen } from '@/ui/Screen'
import { Card } from '@/ui/Card'
import { use, useEffect, useState } from 'react'
import { useCallback } from 'react'
import { storage } from '@navrang/core/services/storage'

export default function StocksScreen() {
  
  const router = useRouter()
  const [filters, setFilters] = useState({user_id: null})
  // const { data, isLoading, refetch } = useStocks({ user_id: 3 })
  const { data, isLoading, refetch } = useUserStocks()
  // console.log('User stocks from hook:', data)
  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await storage.get('user')
        setFilters({user_id: JSON.parse(user)?.id})
        // console.log("User (Stocks.tsx)", JSON.parse(user))
        let response = await getUserStocks()
        // console.log('User stocks response:', response.data.data.length)
      } catch (error) {
        console.log('Error fetching user:', error)
      }
    }
    getUser()
  }, [])

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch])
  )

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  return (
    <Screen title="Stocks">
      {/* <Text style={styles.title}>Stocks</Text> */}

      {/* Stock list will come here */}
      <View style={styles.placeholder}>
        {error ? <View style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: 'red' }}>{error}</Text></View> : null}
        {message ? <View style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: 'green' }}>{message}</Text></View> : null}
        {
          isLoading
          ? <Text>Loading stocks...</Text>
          : data && Array.isArray(data) && data.length > 0
            ? <FlatList
              data={data}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ width: '100%' }}
              renderItem={({ item }) => (
                <Card
                  data={item}
                  onPress={() => router.push(`/stock/${item.id}`)}
                  setError={setError}
                  setMessage={setMessage}
                />
              )}
            />
            : <Text style={styles.muted}>Stock list (coming soon)</Text>
        }
      </View>

      {/* Actions */}
      <Pressable
        style={styles.button}
        onPress={() => router.push('/stocks/newStock')}
      >
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  placeholder: {
    flex: 1,
    // padding: spacing.md,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  muted: {
    color: '#888',
  },
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
  buttonText: {
    color: colors.buttonTextColor,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 20,
  },
})
