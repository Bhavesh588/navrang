import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert, FlatList, Modal } from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { createSale, uploadReceiptToCloud, useUserStocks } from '@navrang/core'
import { Input } from '@/ui/Input'
import { Button } from '@/ui/Button'
import { colors, spacing } from '@/ui/theme'
import { Screen } from '@/ui/Screen'
import { useEffect, useState } from 'react'
import { storage } from '@navrang/core/services/storage'

const emptySaleItem = () => ({
  stock_id: '',
  stock_name: '',
  quantity: '',
  amount: '',
  description: '',
})

export default function NewSaleScreen() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [saleItems, setSaleItems] = useState([emptySaleItem()])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState('')
  const [receiptName, setReceiptName] = useState('')
  const [error, setError] = useState('')
  const [stockDropdownIndex, setStockDropdownIndex] = useState<number | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await storage.get('user')
        if (userData) {
          setUser(JSON.parse(userData))
        }
      } catch (error) {
        console.log('Error fetching user:', error)
      }
    }
    getUser()
  }, [])

  const { data: stocks = [], isLoading: isLoadingStocks } = useUserStocks()

  const handleItemChange = (index: number, field: string, value: string) => {
    setSaleItems((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )))
    setError('')
  }

  const handleSelectStock = (index: number, stock: any) => {
    setSaleItems((prev) => prev.map((item, itemIndex) => (
      itemIndex === index
        ? { ...item, stock_id: stock.id.toString(), stock_name: stock.name }
        : item
    )))
    setStockDropdownIndex(null)
  }

  const handleAddItem = () => {
    setSaleItems((prev) => [...prev, emptySaleItem()])
    setError('')
  }

  const handleRemoveItem = (index: number) => {
    setSaleItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
    setError('')
  }

  const handleUploadReceipt = async () => {
    try {
      setError('')
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        setError('Photo library permission is required to upload a receipt')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      })

      if (result.canceled || !result.assets?.[0]) return

      const asset = result.assets[0]
      const fileBase64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      const filename = asset.fileName || `receipt-${Date.now()}.jpg`
      const mimeType = asset.mimeType || 'image/jpeg'

      setIsUploadingReceipt(true)
      const upload = await uploadReceiptToCloud({
        file_base64: fileBase64,
        filename,
        mime_type: mimeType,
      })

      setReceiptUrl(upload?.data?.data?.file_url || '')
      setReceiptName(filename)
    } catch (err: any) {
      console.log('Error uploading receipt:', err)
      setError(err?.response?.data?.message || err?.message || 'Failed to upload receipt')
    } finally {
      setIsUploadingReceipt(false)
    }
  }

  const handleCreateSale = async () => {
    if (!user?.id) {
      setError('User not found. Please try again.')
      return
    }

    for (const item of saleItems) {
      if (!item.stock_id || !item.amount || !item.quantity) {
        setError('Please fill in all required fields')
        return
      }
    }

    try {
      setIsSubmitting(true)
      setError('')

      const payload = {
        created_by: user.id,
        receipt_url: receiptUrl || null,
        items: saleItems.map((item) => ({
          stock_id: parseInt(item.stock_id),
          quantity: parseFloat(item.quantity),
          amount: parseFloat(item.amount),
          description: item.description || null,
        })),
      }

      const response = await createSale(payload)
      const saleGroupId = response?.data?.data?.sale_group_id

      Alert.alert('Success', 'Sale created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (saleGroupId) {
              router.replace(('/sales/' + saleGroupId) as any)
            } else {
              router.back()
            }
          },
        },
      ])
    } catch (err: any) {
      console.log('Error creating sale:', err)
      setError(err?.response?.data?.message || err?.message || 'Failed to create sale')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Screen title="Create Sale" showBack>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {saleItems.map((item, index) => (
          <View key={index} style={styles.saleItem}>
            <View style={styles.saleItemHeader}>
              <Text style={styles.saleItemTitle}>Sale {index + 1}</Text>
              {saleItems.length > 1 ? (
                <Pressable onPress={() => handleRemoveItem(index)}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Stock *</Text>
              <Pressable
                style={styles.dropdownButton}
                onPress={() => setStockDropdownIndex(index)}
              >
                <Text style={[styles.dropdownButtonText, !item.stock_name && { color: colors.muted }]}>
                  {item.stock_name || 'Select Stock'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Quantity *</Text>
              <Input
                placeholder="Enter quantity"
                value={item.quantity}
                onChangeText={(value) => handleItemChange(index, 'quantity', value)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Amount (Rs) *</Text>
              <Input
                placeholder="Enter amount"
                value={item.amount}
                onChangeText={(value) => handleItemChange(index, 'amount', value)}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Description</Text>
              <Input
                placeholder="Enter description (optional)"
                value={item.description}
                onChangeText={(value) => handleItemChange(index, 'description', value)}
              />
            </View>
          </View>
        ))}

        <Pressable style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>+ Add more</Text>
        </Pressable>

        <View style={styles.receiptSection}>
          <Text style={styles.label}>
            Receipt{' '}
            {receiptUrl ? (
              <Text style={styles.receiptText}>(Uploaded: {receiptName || 'Receipt image'})</Text>
            ) : (
              <Text style={styles.receiptText}>(Optional)</Text>
            )}
          </Text>
          <Pressable
            style={styles.uploadButton}
            onPress={handleUploadReceipt}
            disabled={isUploadingReceipt || isSubmitting}
          >
            <Text style={styles.uploadButtonText}>
              {isUploadingReceipt ? 'Uploading...' : receiptUrl ? 'Change image' : 'Upload image'}
            </Text>
          </Pressable>
        </View>

        <Button onPress={handleCreateSale} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Sales'}
        </Button>
      </ScrollView>

      <Modal visible={stockDropdownIndex !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Stock</Text>
              <Pressable onPress={() => setStockDropdownIndex(null)}>
                <Text style={styles.closeButton}>x</Text>
              </Pressable>
            </View>
            {isLoadingStocks ? (
              <ActivityIndicator style={styles.modalLoader} />
            ) : (
              <FlatList
                data={stocks}
                keyExtractor={(stock) => stock.id.toString()}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No stocks available</Text>
                }
                renderItem={({ item: stock }) => (
                  <Pressable
                    style={styles.modalItem}
                    onPress={() => stockDropdownIndex !== null && handleSelectStock(stockDropdownIndex, stock)}
                  >
                    <Text style={styles.modalItemText}>{stock.name}</Text>
                    <Text style={styles.modalItemMeta}>Available: {stock.current_quantity}</Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  saleItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  saleItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  saleItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  removeText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  formSection: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: 6,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  addButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  addButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  receiptSection: {
    marginBottom: spacing.lg,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  uploadButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  receiptText: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: 13,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: spacing.md,
    borderRadius: 6,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    maxHeight: '70%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    fontSize: 20,
    color: colors.text,
  },
  modalItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: {
    fontSize: 14,
    color: colors.text,
  },
  modalItemMeta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  modalLoader: {
    padding: spacing.lg,
  },
  emptyText: {
    padding: spacing.md,
    color: colors.muted,
    fontSize: 14,
  },
})
