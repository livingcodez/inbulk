/** @jest-environment node */
import { GET as getGroupAddresses } from '../groups/[groupId]/delivery-addresses/route'
import { GET as getMemberAddress } from '../groups/[groupId]/members/[memberId]/delivery-address/route'
import { GET as getProfileAddress } from '../profile/addresses/[addressId]/route'
import { GET as getVendor } from '../user-vendors/[vendorId]/route'
import { createServerClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(),
}))

beforeEach(() => {
  ;(createServerClient as jest.Mock).mockReturnValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: '1' } }, error: null }),
    },
  })
})

describe('dynamic route param promises', () => {
  it('returns 400 when groupId missing', async () => {
    const res = await getGroupAddresses({} as any, { params: Promise.resolve({}) } as any)
    expect(res.status).toBe(400)
  })

  it('returns 400 when memberId missing', async () => {
    const res = await getMemberAddress({} as any, { params: Promise.resolve({}) } as any)
    expect(res.status).toBe(400)
  })

  it('returns 400 when addressId missing', async () => {
    const res = await getProfileAddress({} as any, { params: Promise.resolve({}) } as any)
    expect(res.status).toBe(400)
  })

  it('returns 400 when vendorId missing', async () => {
    const res = await getVendor({} as any, { params: Promise.resolve({}) } as any)
    expect(res.status).toBe(400)
  })
})
