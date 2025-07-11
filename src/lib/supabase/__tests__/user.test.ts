/** @jest-environment node */
import { updateUserProfile } from '../user'
import supabaseClient from '../supabaseClient'

jest.mock('../supabaseClient', () => ({
  __esModule: true,
  default: { from: jest.fn() }
}))

describe('user profile helpers', () => {
  const mockFrom = supabaseClient.from as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates profile', async () => {
    const obj: any = {}
    obj.update = jest.fn().mockReturnValue(obj)
    obj.eq = jest.fn().mockReturnValue(obj)
    obj.select = jest.fn().mockReturnValue(obj)
    obj.single = jest.fn().mockResolvedValue({ data: { id: 'u1' }, error: null })
    mockFrom.mockReturnValue(obj)

    const res = await updateUserProfile('u1', { first_name: 'A' })
    expect(res.id).toBe('u1')
    expect(obj.update).toHaveBeenCalledWith({ first_name: 'A' })
  })
})
