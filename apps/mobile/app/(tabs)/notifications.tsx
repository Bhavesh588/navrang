import React from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useNotifications, useMarkNotificationRead } from '@navrang/core'

export default function NotificationsScreen() {
  const { data: notifications = [], isLoading, isError } = useNotifications()
  const markReadMutation = useMarkNotificationRead()

  const handleMarkRead = (id) => {
    markReadMutation.mutate(id)
  }

  const renderItem = ({ item }) => (
    <View
      style={{
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
        backgroundColor: item.is_read ? '#FFF' : '#F2F8FF'
      }}
    >
      <Text style={{ fontWeight: item.is_read ? '400' : '700', marginBottom: 4 }}>
        {item.message}
      </Text>
      <Text style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
      {!item.is_read && (
        <Pressable
          onPress={() => handleMarkRead(item.id)}
          style={{
            alignSelf: 'flex-start',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 6,
            backgroundColor: '#007AFF'
          }}
        >
          <Text style={{ color: '#fff' }}>Mark as read</Text>
        </Pressable>
      )}
    </View>
  )

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading notifications…</Text>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Unable to load notifications.</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 24 }}
      ListEmptyComponent={() => (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text>No notifications yet.</Text>
        </View>
      )}
    />
  )
}
