/** @jest-environment jsdom */
import { AddProductModal } from '../AddProductModal'
import { render, waitFor } from '@testing-library/react'
import React, { useEffect } from 'react'

jest.mock('@/contexts/SupabaseProvider', () => ({
  useSupabase: () => ({ profile: { id: '1' } })
}))

const createProductMock = jest.fn()
jest.mock('@/lib/supabase/products', () => ({
  createProduct: (...args: any[]) => createProductMock(...args)
}))

// Mock ProductListingForm to trigger submit with resolved url
jest.mock('../ProductListingForm', () => ({
  ProductListingForm: ({ onSubmit }: any) => {
    const data = {
      name: 'Test',
      description: 'long description',
      category: 'Electronics',
      subcategory: null,
      subscriptionUsername: null,
      subscriptionPassword: null,
      subscription2FAKey: null,
      actualCost: 10,
      image_url: 'http://resolved.img',
      deliveryTime: 'Instant',
      customDeliveryTimeDescription: null,
      isFungible: false,
      createTimedGroup: false,
      groupSize: 5,
      countdownSecs: null,
      selectedVendorId: '1'
    }
    useEffect(() => {
      onSubmit(data)
    }, [onSubmit])
    return <div data-testid="mock-form" />
  }
}))


describe('AddProductModal integration', () => {
  it('passes resolved url to createProduct', async () => {
    render(<AddProductModal isOpen={true} onClose={jest.fn()} onProductAdded={jest.fn()} />)
    await waitFor(() => expect(createProductMock).toHaveBeenCalledWith(expect.objectContaining({ image_url: 'http://resolved.img' })))
  })
})
