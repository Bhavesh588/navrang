import { TextInput, StyleSheet } from 'react-native'
import { colors, spacing, radius } from './theme'

type Props = React.ComponentProps<typeof TextInput>

export const Input = (props: Props) => {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.muted}
      selectionColor={colors.primary}
      cursorColor={colors.primary}
      style={[styles.input, props.style]}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
})
