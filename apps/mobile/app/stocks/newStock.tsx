import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { useCategories, useCreateStock, useStocks, useUserCategories } from '@navrang/core'
import { Stack, useRouter } from 'expo-router'
import { Screen } from '@/ui/Screen'
import CustomDropdown from '@/components/ui/CustomDropdown/CustomDropdown'
import { storage } from '@navrang/core/services/storage'

interface Category {
  id: number
  name: string
  department_id: number
}

export default function NewStockScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [current_quantity, setCurrentQuantity] = useState('')
  const [category_id, setCategoryId] = useState('')
  const [department_id, setDepartmentId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  interface UserData {
    role_name?: string
    [key: string]: any
  }
  const [userData, setUserData] = useState<UserData | null>(null)

  const createStockMutation = useCreateStock()
  // const { data: categories } = useCategories()
  const { data: categoriesData } = useUserCategories()
  const categories = Array.isArray(categoriesData) ? categoriesData : []
  // console.log('User categories from hook:', categories)
  // console.log('Categories:', categories.data.map((c: any) => ({ name: c.name })))

  const [category, setCategory] = useState<Category | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await storage.get('user')
        console.log("User", JSON.parse(user))
        setUserData(JSON.parse(user))
      } catch (error) {
        console.log('Error fetching user:', error)
      }
    }
    getUser()
  }, [])

  return (
    <Screen title="Add New Stock" showBack>
      <Stack.Screen options={{ headerShown: false }} />
      {/* <Pressable onPress={() => router.back()}>
        <Text style={{ marginBottom: 16 }}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Add / Remove Stock</Text> */}

      <TextInput
        placeholder="Stock Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Current Quantity"
        keyboardType="numeric"
        style={styles.input}
        value={current_quantity}
        onChangeText={setCurrentQuantity}
      />

      <CustomDropdown<Category>
        label="Category"
        value={category}
        onSelect={setCategory}
        staticData={categories || []}
        searchable
        // fetchUrl="http://localhost:5000/categories"
        allowAddNew={userData?.role_name === 'admin'}
      />

      {/* <TextInput
        placeholder="Category ID"
        style={styles.input}
        value={category_id}
        onChangeText={setCategoryId}
      /> */}

      {/* <TextInput
        placeholder="Department ID"
        style={styles.input}
        value={department_id}
        onChangeText={setDepartmentId}
      /> */}

      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          setError('')
          setMessage('')
          if (!name) return setError('Stock Name is required')
            const q = parseInt(current_quantity, 10)
          if (!q || q <= 0) return setError('Quantity must be a positive number')

          createStockMutation.mutate(
            { name, current_quantity: q, category_id: category?.id, department_id: category?.department_id },
            {
              onSuccess: () => {
                setMessage('Created successfully')
                setName('')
                setCurrentQuantity('')
                setCategoryId('')
                setDepartmentId('')
              },
              onError: (err: any) => {
                console.log(err)
                setError(err?.message || 'Create failed')
              },
            }
          )
        }}
        disabled={createStockMutation.isLoading}
      >
        {createStockMutation.isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Stock</Text>
        )}
      </Pressable>

      {/* <Pressable
        style={styles.dangerButton}
        onPress={() => {
          setError('')
          setMessage('')
          if (!stockName) return setError('Stock Name is required')
          const q = parseInt(quantity, 10)
          if (!q || q <= 0) return setError('Quantity must be a positive number')

          removeMutation.mutate(
            { stockName, quantity: q, reason },
            {
              onSuccess: () => {
                setMessage('Removed successfully')
                setQuantity('')
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
      </Pressable> */}
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
