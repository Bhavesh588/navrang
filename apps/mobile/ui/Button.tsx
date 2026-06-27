import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { colors, spacing, radius } from './theme'

type Props = {
  children: React.ReactNode
  style?: any
  onPress?: () => void
  loading?: boolean
  variant?: 'primary' | 'danger'
  disabled?: boolean
}

export const Button = ({
  children,
  style,
  onPress,
  loading,
  variant = 'primary',
  disabled,
}: Props) => {
  const backgroundColor =
    variant === 'danger' ? colors.danger : colors.primary

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        style,
        styles.button,
        { backgroundColor },
        disabled && { opacity: 0.6 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.buttonBGColor} />
      ) : (
        <Text style={styles.text}>{children}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  text: {
    color: colors.buttonTextColor,
    fontWeight: '600',
  },
})
