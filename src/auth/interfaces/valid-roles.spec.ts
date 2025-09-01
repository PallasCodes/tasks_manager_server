import { ValidRoles } from './valid-roles.enum'

describe('Valid roles Enum', () => {
  it('should have correct values', () => {
    expect(ValidRoles.admin).toBe('admin')
    expect(ValidRoles.superuser).toBe('superuser')
    expect(ValidRoles.user).toBe('user')
  })

  it('should contain all expected values', () => {
    const keyToHave = ['admin', 'superuser', 'user']

    expect(Object.values(ValidRoles)).toEqual(expect.arrayContaining(keyToHave))
  })
})
