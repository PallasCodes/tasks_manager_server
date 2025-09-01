import { SetMetadata } from '@nestjs/common'

import { ValidRoles } from '../../interfaces/valid-roles.enum'
import { META_ROLES, RoleProtected } from './role-protected.decorator'

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn()
}))

describe('RoleProtected Decorator', () => {
  it('should set metadata with the correct roles', () => {
    const roles = [ValidRoles.admin, ValidRoles.user]

    RoleProtected(...roles)

    expect(SetMetadata).toHaveBeenCalled()
    expect(SetMetadata).toHaveBeenCalledWith(META_ROLES, roles)
  })
})
