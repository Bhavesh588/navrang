import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { useAddStock, useRemoveStock } from '@navrang/core'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Screen } from '@/ui/Screen'

export default function ManageStockScreen() {

  const { stockId } = useLocalSearchParams()

  const numericId =
    typeof stockId === "string"
      ? parseInt(stockId, 10)
      : Array.isArray(stockId)
      ? parseInt(stockId[0], 10)
      : undefined

  const router = useRouter()
  const [quantity, setQuantity] = useState('')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const addMutation = useAddStock()
  const removeMutation = useRemoveStock()

  return (
    <Screen title="Add / Remove Stock" showBack>
      <Stack.Screen options={{ headerShown: false }} />
      {/* <Pressable onPress={() => router.back()}>
        <Text style={{ marginBottom: 16 }}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Add / Remove Stock</Text> */}

      {/* <TextInput
        placeholder="Stock ID"
        style={styles.input}
        value={stockId}
        onChangeText={setStockId}
      /> */}

      <TextInput
        placeholder="Quantity"
        keyboardType="numeric"
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
      />

      <TextInput
        placeholder="Remarks (for remove)"
        style={styles.input}
        value={remarks}
        onChangeText={setRemarks}
      />

      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          setError('')
          setMessage('')
          // if (!stockId) return setError('Stock ID is required')
          const q = parseInt(quantity, 10)
          if (!q || q <= 0) return setError('Quantity must be a positive number')

          addMutation.mutate(
            { stockId: numericId, quantity: q, remarks },
            {
              onSuccess: () => {
                setMessage('Added successfully')
                setQuantity('')
                setRemarks('')
              },
              onError: (err: any) => {
                console.log(err)
                setError(err?.message || 'Add failed')
              },
            }
          )
        }}
        disabled={addMutation.isLoading}
      >
        {addMutation.isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add Stock</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.dangerButton}
        onPress={() => {
          setError('')
          setMessage('')
          // if (!stockId) return setError('Stock ID is required')
          const q = parseInt(quantity, 10)
          if (!q || q <= 0) return setError('Quantity must be a positive number')

          removeMutation.mutate(
            { stockId: numericId, quantity: q, remarks },
            {
              onSuccess: () => {
                setMessage('Removed successfully')
                setQuantity('')
                setRemarks('')
              },
              onError: (err: any) => setError(err?.message || 'Remove failed'),
            }
          )
        }}
        disabled={removeMutation.isLoading}
      >
        {removeMutation.isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Remove Stock</Text>
        )}
      </Pressable>
      <Text>{error}</Text>
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
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  dangerButton: {
    backgroundColor: '#b00020',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
})
