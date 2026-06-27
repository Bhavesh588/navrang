import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useDeleteSaleGroup, useSaleGroup } from '@navrang/core'
import { Screen } from '@/ui/Screen'
import { colors, spacing } from '@/ui/theme'

export default function SaleDetailsScreen() {
  const router = useRouter()
  const { saleGroupId } = useLocalSearchParams<{ saleGroupId: string }>()
  const { data: saleGroupRes, isLoading, error } = useSaleGroup(saleGroupId)
  const deleteSaleGroup = useDeleteSaleGroup()

  const saleGroup = saleGroupRes?.data
  const sales = saleGroup?.sales || []

  const handleRemoveSale = () => {
    if (!saleGroupId || deleteSaleGroup.isPending) return

    Alert.alert(
      'Remove sale?',
      'This will remove the sale and add the quantity back to each selected stock.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSaleGroup.mutateAsync(saleGroupId)
              Alert.alert('Removed', 'Sale removed and stock restored.', [
                { text: 'OK', onPress: () => router.back() },
              ])
            } catch (err: any) {
              Alert.alert(
                'Failed to remove sale',
                err?.response?.data?.message || err?.message || 'Please try again.'
              )
            }
          },
        },
      ]
    )
  }

  return (
    <Screen title="Sale Details" showBack>
      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading sale...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Failed to load sale details</Text>
        </View>
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Sale #{saleGroup?.sale_group_id}</Text>
              <Text style={styles.summaryText}>Items: {sales.length}</Text>
              <Text style={styles.summaryText}>Total quantity: {saleGroup?.total_quantity}</Text>
              <Text style={styles.summaryAmount}>Total: Rs {saleGroup?.total_amount}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.saleCard}>
              <Text style={styles.stockName}>{item.stock_name || 'Stock'}</Text>
              <Text style={styles.saleMeta}>Quantity: {item.quantity}</Text>
              <Text style={styles.saleMeta}>Amount: Rs {item.amount}</Text>
              <Text style={styles.description}>{item.description || 'No description'}</Text>
            </View>
          )}
          ListFooterComponent={
            <>
              <View style={styles.receiptBox}>
                <Text style={styles.receiptTitle}>Receipt</Text>
                {saleGroup?.receipt_url ? (
                  <Image
                    source={{ uri: saleGroup.receipt_url }}
                    style={styles.receiptImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.receiptText}>No receipt uploaded</Text>
                )}
              </View>

              <Pressable
                style={[styles.removeButton, deleteSaleGroup.isPending && styles.disabledButton]}
                onPress={handleRemoveSale}
                disabled={deleteSaleGroup.isPending}
              >
                <Text style={styles.removeButtonText}>
                  {deleteSaleGroup.isPending ? 'Removing...' : 'Remove Sale'}
                </Text>
              </Pressable>
            </>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.muted,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  summary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  saleCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stockName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  saleMeta: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 12,
    color: colors.muted,
  },
  receiptBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  receiptTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  receiptText: {
    fontSize: 13,
    color: colors.muted,
  },
  receiptImage: {
    width: '100%',
    height: 220,
    borderRadius: 6,
    backgroundColor: colors.background,
  },
  removeButton: {
    backgroundColor: colors.danger,
    borderRadius: 6,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  removeButtonText: {
    color: colors.buttonTextColor,
    fontSize: 14,
    fontWeight: '600',
  },
})
