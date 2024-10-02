import { Fruit, FruitData } from '../../models/fruit.ts'
import { useState } from 'react'
import SelectedFruitForm from './SelectedFruit.tsx'
import AddFruitForm from './AddFruit.tsx'
import { ErrorMessage } from './Styled.tsx'
import { useFruits } from '../hooks.ts'
import { useAuth0 } from '@auth0/auth0-react'

type FormState =
  | {
      selectedFruit: Fruit
      show: 'selected'
    }
  | {
      selectedFruit: null
      show: 'add' | 'none'
    }

function Fruits() {
  const [error, setError] = useState<string>('')
  const [form, setForm] = useState<FormState>({
    selectedFruit: null,
    show: 'none',
  })
  const fruits = useFruits()

  const { getAccessTokenSilently } = useAuth0()

  const handleMutationSuccess = () => {
    handleCloseForm()
    setError('')
  }

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      setError(error.message)
    } else {
      setError('Unknown error')
    }
  }

  const mutationOptions = {
    onSuccess: handleMutationSuccess,
    onError: handleError,
  }

  const handleAdd = async (fruit: FruitData) => {
    try {
      const token = await getAccessTokenSilently()
      fruits.add.mutate({ fruit, token }, mutationOptions)
    } catch (err) {
      handleError(err)
    }
  }

  const handleUpdate = async (fruit: Fruit) => {
    try {
      const token = await getAccessTokenSilently()
      fruits.update.mutate({ fruit, token }, mutationOptions)
    } catch (err) {
      handleError(err)
    }
  }

  const handleDeleteFruit = async (id: number) => {
    try {
      const token = await getAccessTokenSilently()
      fruits.delete.mutate({ id, token }, mutationOptions)
      console.log('Fruit deleted successfully')
    } catch (err) {
      handleError(err)
    }
  }

  const hideError = () => {
    setError('')
  }

  const handleOpenAddForm = () => {
    setForm({ show: 'add', selectedFruit: null })
  }

  const handleCloseForm = () => {
    setForm({ show: 'none', selectedFruit: null })
  }

  const handleSelectFruit = (fruit: Fruit) => {
    setForm({ show: 'selected', selectedFruit: fruit })
  }

  if (fruits.isPending) {
    let failures = ''
    if (fruits.failureCount > 0) {
      failures = ` (failed ${fruits.failureCount} times)`
    }

    return <div>Loading... {failures}</div>
  }

  let fetchStatus = ''
  if (fruits.add.isPending) fetchStatus = 'Adding...'
  if (fruits.update.isPending) fetchStatus = 'Updating...'
  if (fruits.delete.isPending) fetchStatus = 'Deleting...'
  if (fruits.isRefetching) fetchStatus = 'Refreshing...'

  if (fruits.error instanceof Error) {
    return (
      <ErrorMessage>Failed to load fruits: {fruits.error.message}</ErrorMessage>
    )
  }

  return (
    <>
      {error !== '' && (
        <ErrorMessage onClick={hideError}>Error: {error}</ErrorMessage>
      )}
      {fetchStatus !== '' && <div>{fetchStatus}</div>}
      <ul>
        {fruits.status === 'success' &&
          fruits.data.map((fruit) => (
            <li key={fruit.id}>
              <button onClick={() => handleSelectFruit(fruit)}>
                {fruit.name}
              </button>
            </li>
          ))}
      </ul>
      {form.show === 'add' ? (
        <AddFruitForm onAdd={handleAdd} onClose={handleCloseForm} />
      ) : (
        <button onClick={handleOpenAddForm}>Add a Fruit</button>
      )}
      {form.show === 'selected' && form.selectedFruit && (
        <SelectedFruitForm
          key={form.selectedFruit.id}
          fruit={form.selectedFruit}
          onUpdate={handleUpdate}
          onDelete={handleDeleteFruit}
          onClose={handleCloseForm}
        />
      )}
    </>
  )
}

export default Fruits
