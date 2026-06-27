import { useCreateCategory } from '@navrang/core'
import { storage } from '@navrang/core/services/storage'
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'

/* ---------------------------------- */
/* Types */
/* ---------------------------------- */

export interface DropdownItem {
  id: string | number
  name: string
  department_id?: number
  department_name?: string
}

interface CustomDropdownProps<T extends DropdownItem> {
  label: string
  value: T | null
  onSelect: (item: T) => void

  searchable?: boolean
  fetchUrl?: string | null

  staticData?: T[]

  allowAddNew?: boolean
  onAddNew?: (item: T) => void
  nested?: boolean
}

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

function CustomDropdown<T extends DropdownItem>({
  label,
  value,
  onSelect,
  searchable = false,
  fetchUrl = null,
  staticData = [],
  allowAddNew = false,
  onAddNew,
  nested = false,
}: CustomDropdownProps<T>) {
  const [visible, setVisible] = useState<boolean>(false)
  const [data, setData] = useState<T[]>([])
  const [search, setSearch] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [departmentId, setDepartmentId] = useState<DropdownItem | null>(null) // For nested dropdown

  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [newItemName, setNewItemName] = useState<string>('')
  const [userData, setUserData] = useState(null)

  const createCategoryMutation = useCreateCategory()


  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await storage.get('user')
        // console.log("User", JSON.parse(user))
        setUserData(JSON.parse(user))
      } catch (error) {
        console.log('Error fetching user:', error)
      }
    }
    getUser()
  }, [])
  /* ---------------------------------- */
  /* Fetch Data */
  /* ---------------------------------- */

  useEffect(() => {
    // console.log(searchable, fetchUrl, visible)
    if (searchable && fetchUrl && visible) {
      fetchData()
    } else {
      // console.log("Static Data:", staticData)
      setData(staticData)
    }
  }, [visible])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(fetchUrl as string)
      const json = await response.json()

      // Assuming API returns { data: [] }
      const result: T[] = json.data ?? json
      setData(result)
    } catch (error) {
      console.log('Dropdown fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  /* ---------------------------------- */
  /* Filtering */
  /* ---------------------------------- */

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  /* ---------------------------------- */
  /* Add New */
  /* ---------------------------------- */

  const handleAddNew = async () => {
    if (!newItemName.trim()) return

    const newItem = {
      // id: Date.now(),
      name: newItemName,
      department_id: departmentId?.id,
      // department_name: departmentId?.name
    } as T

    let newCategory = await createCategoryMutation.mutateAsync(
      newItem,
      {
        onSuccess: () => {
          console.log('Category created successfully')
          setDepartmentId(null)
        },
        onError: (err: any) => {
          console.log(err)
          // setError(err?.message || 'Create failed')
        },
      }
    )
    console.log('Created Category:', newCategory.data.data)
    // if (onAddNew) {
    //   onAddNew(newCategory)
    // }

    setData(prev => [...prev, newCategory.data.data])
    setNewItemName('')
    setShowAddModal(false)
  }

  /* ---------------------------------- */
  /* UI */
  /* ---------------------------------- */

  return (
    <View style={{ marginBottom: 15 }}>
      {!nested && <Text style={styles.label}>{label}</Text>}
      {/* <Text style={styles.label}>{label}</Text> */}

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setVisible(true)}
      >
        <Text>{value?.name ?? `Select ${label}`}</Text>
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal visible={visible} animationType="slide">
        <View style={styles.modalContainer}>
          {searchable && (
            <TextInput
              placeholder={`Search ${label}`}
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          )}

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <FlatList
              data={searchable ? filteredData : data}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    onSelect(item)
                    setVisible(false)
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {allowAddNew && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={{ color: '#fff' }}>
                + Add New {label}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setVisible(false)}
          >
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Add New Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.addModalContainer}>
          <View style={styles.addModalContent}>
            <Text style={styles.label}>Add New {label}</Text>

            <TextInput
              placeholder={`${label} Name`}
              style={styles.searchInput}
              value={newItemName}
              onChangeText={setNewItemName}
            />

            <Text style={styles.label}>Department</Text>
            <CustomDropdown<DropdownItem>
              label="Department"
              value={departmentId}
              onSelect={setDepartmentId}
              staticData={[{id: 1, name: 'Updated Department'}, {id: 3, name: 'Warehouse'}]} // Replace with actual data
              // fetchUrl="YOUR_API_ENDPOINT"
              searchable
              onAddNew={createCategoryMutation}
              nested={true}
            />

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddNew}
            >
              <Text style={{ color: '#fff' }}>Create</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
            >
              <Text style={{ marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default CustomDropdown

const styles = StyleSheet.create({
  label: {
    marginBottom: 5,
    fontWeight: '600',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  addModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  addModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
})