import { View, StyleSheet, Pressable, Text} from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing } from './theme'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export const Screen = ({ children, title, showBack = false}: { children: React.ReactNode, title: string, showBack?: boolean}) => {
  const router = useRouter()
  return (
    <SafeAreaProvider style={styles.safe}>
      <View style={styles.header}>
        {showBack ? (
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </Pressable>
        ) : 
        (
          null
          // <View style={{ width: 24 }} />
        )
        }
  
        <Text style={styles.title}>{title}</Text>
  
        {/* Right spacer for symmetry */}
        <View style={{ width: 24, backgroundColor: '#111'}} />
      </View>
      <View style={styles.container}>
        {children}
      </View>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    height: 65,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',

  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  back: {
    fontSize: 18,
  },
})
