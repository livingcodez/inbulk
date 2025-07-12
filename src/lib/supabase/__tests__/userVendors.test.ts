/** @jest-environment node */
import { createUserVendor, getUserVendors, deleteUserVendor } from '../userVendors'
import supabaseClient from '../supabaseClient'

jest.mock('../supabaseClient', () => ({
  __esModule: true,
  default: { from: jest.fn() }
}))

describe('user vendor helpers', () => {
  const mockFrom = supabaseClient.from as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates vendor', async () => {
    const single = jest.fn().mockResolvedValue({ data: { id: '1' }, error: null })
    const select = jest.fn().mockReturnValue({ single })
    const insert = jest.fn().mockReturnValue({ select })
    mockFrom.mockReturnValue({ insert })

    const res = await createUserVendor({ name: 'A' })
    expect(res.id).toBe('1')
    expect(insert).toHaveBeenCalled()
  })

  it('gets vendors', async () => {
    const order = jest.fn().mockResolvedValue({ data: [], error: null })
    const select = jest.fn().mockReturnValue({ order })
    mockFrom.mockReturnValue({ select })
    await getUserVendors()
    expect(mockFrom).toHaveBeenCalledWith('user_managed_vendors')
  })

  it('deletes vendor', async () => {
    const final = jest.fn().mockResolvedValue({ error: null })
    const eq = jest.fn().mockReturnValue({ eq: final })
    mockFrom.mockReturnValue({ delete: jest.fn().mockReturnValue({ eq }) })
    await deleteUserVendor('1')
    expect(mockFrom).toHaveBeenCalled()
  })
})
