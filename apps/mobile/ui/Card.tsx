import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native'
import { colors, spacing, radius } from './theme'
import { FontAwesome } from '@expo/vector-icons'
import { useDeleteStock } from '@navrang/core'
import { useState } from 'react'

type Props = {
//   children: React.ReactNode
  data: any
  style?: any
  onPress?: () => void
  loading?: boolean
  variant?: 'primary' | 'danger'
  disabled?: boolean,
  setError: (msg: string) => void
  setMessage: (msg: string) => void
}

export const Card = ({
//   children,
  data,
  style,
  onPress,
  loading,
  variant = 'primary',
  disabled,
  setError,
  setMessage,
}: Props) => {

  const deleteMutation = useDeleteStock()

  return (
    <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={[
            style,
            styles.card,
            disabled && { opacity: 0.6 },
        ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>
        {data.name}
        </Text>
        <Text>Qty: {data.current_quantity}</Text>
      </View>
      <View>
        <Pressable
          onPress={() => {
            setError('')
            setMessage('')
            deleteMutation.mutate(
              { stockId: data.id },
              {
                onSuccess: () => {
                  setMessage('Deleted successfully')
                },
                onError: (err: any) => {
                  console.log(err)
                  setError(err?.message || 'Delete failed')
                },
              }
            )
          }}
          disabled={disabled || loading}
          style={[
            {
              marginTop: 8,
              backgroundColor: colors.danger,
              padding: spacing.sm,
              borderRadius: radius.md,
              alignItems: 'center',
              justifyContent: 'center',
            },
            disabled && { opacity: 0.6 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              <FontAwesome name="trash" size={15} color={colors.buttonTextColor} />
            </Text>
          )}
        </Pressable>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 12,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
})
