import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'
import { useLogin } from '@navrang/core'
import { Button } from '@/ui/Button'
import { Input } from '@/ui/Input'
import { storage } from '@navrang/core/services/storage'
import http from '@navrang/core/services/http'

export default function LoginScreen() {
  const loginMutation = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (!email || !password) return

    loginMutation.mutate({ email, password })
  }

  const loginError = loginMutation.error
  const errorMessage =
    loginError?.response?.data?.message ||
    (loginError?.request ? 'Could not connect to backend. Check API URL and backend server.' : null) ||
    loginError?.message ||
    'Login failed'

  return (
    <View style={styles.container}>
      <Text>{http.defaults.baseURL}</Text>
      <Text style={styles.title}>Login</Text>

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button
        onPress={handleLogin}
        loading={loginMutation.isPending}
        variant="primary"
        disabled={loginMutation.isPending}
      >
        Login
      </Button>

      {loginMutation.isError && (
        <Text style={styles.error}>
          {errorMessage}
        </Text>
      )}

      {/* <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 6,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 12,
    textAlign: 'center',
  },
})
