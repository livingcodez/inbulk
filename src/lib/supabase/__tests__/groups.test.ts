/** @jest-environment node */
import { joinGroup } from '../groups'
import supabaseClient from '../supabaseClient'

jest.mock('../supabaseClient', () => ({
  __esModule: true,
  default: { from: jest.fn(), rpc: jest.fn() }
}))

describe('joinGroup', () => {
  const mockFrom = supabaseClient.from as jest.Mock
  const mockRpc = supabaseClient.rpc as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  function setupProfile(profile: any) {
    const obj: any = {}
    obj.select = jest.fn().mockReturnValue(obj)
    obj.eq = jest.fn().mockReturnValue(obj)
    obj.single = jest.fn().mockResolvedValue({ data: profile, error: null })
    mockFrom.mockReturnValueOnce(obj)
  }

  function setupMemberCheck() {
    const obj: any = {}
    obj.select = jest.fn().mockReturnValue(obj)
    obj.eq = jest.fn().mockReturnValue(obj)
    obj.single = jest.fn().mockResolvedValue({ data: null, error: null })
    mockFrom.mockReturnValueOnce(obj)
  }

  function setupInsert() {
    const obj: any = {}
    obj.insert = jest.fn().mockReturnValue(obj)
    obj.select = jest.fn().mockReturnValue(obj)
    obj.single = jest.fn().mockResolvedValue({ data: { id: 'm1' }, error: null })
    mockFrom.mockReturnValueOnce(obj)
  }

  it('throws when shipping info missing', async () => {
    setupProfile({ first_name: null, last_name: null, shipping_address: null, phone_number: null })
    setupMemberCheck()
    await expect(joinGroup('g1', 'u1')).rejects.toThrow('Missing shipping information')
  })
})
