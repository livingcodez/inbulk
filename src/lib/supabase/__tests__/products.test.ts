/** @jest-environment node */
import { createProduct } from '../products'
import { createGroup } from '../groups'
import supabaseClient from '../supabaseClient'

jest.mock('../supabaseClient', () => ({
  __esModule: true,
  default: { from: jest.fn() }
}))

jest.mock('../groups', () => ({
  __esModule: true,
  createGroup: jest.fn()
}))

describe('createProduct', () => {
  const mockFrom = supabaseClient.from as jest.Mock
  const mockCreateGroup = createGroup as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  function setupInsert(returnData: any) {
    const single = jest.fn().mockResolvedValue({ data: returnData, error: null })
    const select = jest.fn().mockReturnValue({ single })
    const insert = jest.fn().mockReturnValue({ select })
    mockFrom.mockReturnValue({ insert })
  }

  it('creates timed group when createTimedGroup is true', async () => {
    setupInsert({ id: 'prod1', vendor_id: 'vendor1' })

    await createProduct({
      title: 'Timed',
      description: null,
      price: 10,
      image_url: null,
      vendor_id: 'vendor1',
      category: 'Electronics',
      subcategory: null,
      max_participants: 5,
      actual_cost: 50,
      is_fungible: false,
      delivery_time: null,
      createTimedGroup: true,
      groupSize: 5,
      countdownSecs: 3600
    } as any)

    expect(mockCreateGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        product_id: 'prod1',
        escrow_amount: 10,
        target_count: 5,
        vendor_id: 'vendor1'
      })
    )
    const args = mockCreateGroup.mock.calls[0][0]
    expect(args.expires_at).toBeTruthy()
  })

  it('creates untimed group when createTimedGroup is false', async () => {
    setupInsert({ id: 'prod2', vendor_id: 'vendor2' })

    await createProduct({
      title: 'Untimed',
      description: null,
      price: 10,
      image_url: null,
      vendor_id: 'vendor2',
      category: 'Electronics',
      subcategory: null,
      max_participants: 5,
      actual_cost: 50,
      is_fungible: false,
      delivery_time: null,
      createTimedGroup: false,
      groupSize: 5,
      countdownSecs: null
    } as any)

    expect(mockCreateGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        product_id: 'prod2',
        escrow_amount: 10,
        target_count: 5,
        vendor_id: 'vendor2',
        expires_at: null
      })
    )
  })
})
