import { render, screen } from '@testing-library/react'
import { BuyerActions } from '../BuyerActions'
import { VendorActions } from '../VendorActions'

// Mock AddProductModal to avoid importing Supabase deps
jest.mock('@/components/products/AddProductModal', () => ({
  AddProductModal: () => <div data-testid="modal" />
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() })
}))

function DashboardActions({ currentRole, activeTab }: { currentRole: string; activeTab: string }) {
  return (
    <>
      {currentRole === 'buyer' && activeTab === 'explore' && <BuyerActions />}
      {currentRole === 'vendor' && <VendorActions />}
    </>
  )
}

describe('Dashboard FAB visibility', () => {
  it('shows BuyerActions FAB for buyer explore mode', () => {
    render(<DashboardActions currentRole="buyer" activeTab="explore" />)
    expect(screen.getByLabelText('Suggest new product')).toBeInTheDocument()
  })

  it('hides BuyerActions FAB for vendor mode', () => {
    render(<DashboardActions currentRole="vendor" activeTab="mylistings" />)
    expect(screen.queryByLabelText('Suggest new product')).toBeNull()
  })
})
