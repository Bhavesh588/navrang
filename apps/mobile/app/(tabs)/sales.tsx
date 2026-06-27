import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { useSales, useUserSales } from '@navrang/core'
import { colors, spacing } from '@/ui/theme'
import { Screen } from '@/ui/Screen'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { storage } from '@navrang/core/services/storage'

export default function SalesScreen() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Fetch user from storage
  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await storage.get('user')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          setIsAdmin(parsedUser?.role_name === 'admin')
        }
      } catch (error) {
        console.log('Error fetching user:', error)
      }
    }
    getUser()
  }, [])

  // Fetch all sales if admin, user sales if employee
  const { data: allSales, isLoading: allLoading, refetch: refetchAll } = useSales({})
  const { data: userSales, isLoading: userLoading, refetch: refetchUser } = useUserSales(user?.id)

  const sales = isAdmin ? allSales : userSales
  const isLoading = isAdmin ? allLoading : userLoading
  const saleRows = sales?.data || []
  const groupedSales = useMemo(() => {
    const groups = new Map<string, any>()

    saleRows.forEach((sale: any) => {
      const saleGroupId = sale.sale_group_id || `sale-${sale.id}`
      const existing = groups.get(saleGroupId)
      const amount = parseFloat(sale.amount || 0)
      const quantity = parseFloat(sale.quantity || 0)

      if (existing) {
        existing.amount += amount
        existing.quantity += quantity
        existing.item_count += 1
        existing.stock_names.push(sale.stock_name || 'Stock')
        if (new Date(sale.created_at) > new Date(existing.created_at)) {
          existing.created_at = sale.created_at
        }
      } else {
        groups.set(saleGroupId, {
          sale_group_id: saleGroupId,
          amount,
          quantity,
          item_count: 1,
          stock_names: [sale.stock_name || 'Stock'],
          description: sale.description,
          created_at: sale.created_at,
        })
      }
    })

    return Array.from(groups.values()).sort((a, b) => (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ))
  }, [saleRows])

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) {
        refetchAll()
      } else if (user?.id) {
        refetchUser()
      }
    }, [isAdmin, user?.id, refetchAll, refetchUser])
  )

  const renderSaleItem = ({ item }: { item: any }) => (
    <Pressable
      style={styles.saleCard}
      onPress={() => router.push(('/sales/' + item.sale_group_id) as any)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.stockName}>
          {item.item_count > 1 ? `${item.item_count} stocks` : item.stock_names[0]}
        </Text>
        <Text style={styles.saleMeta}>Quantity: {item.quantity}</Text>
        <Text style={styles.description}>
          {item.item_count > 1 ? item.stock_names.join(', ') : item.description || 'No description'}
        </Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>Rs {item.amount}</Text>
      </View>
    </Pressable>
  )

  return (
    <Screen title={isAdmin ? 'All Sales' : 'My Sales'}>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading sales...</Text>
          </View>
        ) : groupedSales.length > 0 ? (
          <FlatList
            data={groupedSales}
            keyExtractor={(item) => item.sale_group_id}
            renderItem={renderSaleItem}
            contentContainerStyle={{ paddingBottom: spacing.lg }}
            scrollEnabled={true}
          />
        ) : (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No sales found</Text>
          </View>
        )}
      </View>

      {/* Add Sale Button */}
      <Pressable
        style={styles.button}
        onPress={() => router.push('/sales/newSale')}
      >
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saleCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  stockName: {
    fontSize: 16,
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
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: 12,
    color: colors.muted,
  },
  amountContainer: {
    marginLeft: spacing.md,
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 6,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.buttonTextColor,
  },
  button: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 28,
    color: colors.buttonTextColor,
    fontWeight: '300',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.muted,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
  },
})
