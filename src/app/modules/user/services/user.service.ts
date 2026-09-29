import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { asyncForEach, generateStrongPassword } from '@src/shared';
import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '@src/shared/utils/dborm.utils';
import { isNotEmptyObject } from 'class-validator';
import { DataSource, FindOptionsRelations, Repository } from 'typeorm';
import { FilterRoleDTO } from '../../acl/dtos';
import { RoleService } from '../../acl/services/role.service';
import { UpdateRolesDTO, UpdateUserDTO, UserCreateDTO, UserRoleAssignOrRemoveDTO } from '../dtos';
import { User } from '../entities/user.entity';
import { UserRole } from './../entities/userRole.entity';
import { UserRoleService } from './userRole.service';
import { IAuthUser } from '@src/app/interfaces';
import { ENUM_ACL_DEFAULT_ROLES } from '@src/shared';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly _repo: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
  ) {
    super(_repo);
  }

  async availableRoles(id: string | string, payload: FilterRoleDTO): Promise<any> {
    const isExist = await this.isExist({ id: id });

    const { data: roles } = await this.roleService.findAllBase(payload);

    const userRoles = await this.userRoleService.find({
      where: {
        userId: isExist.id,
      },
    });

    if (roles && roles.length > 0) {
      roles.forEach((role) => {
        const isAlreadyAdded = userRoles.find((userRole) => userRole.roleId === role.id);
        role.isAlreadyAdded = !!isAlreadyAdded;
      });
    }

    return roles;
  }

  async createUser(payload: UserCreateDTO, authUser: IAuthUser, relations?: FindOptionsRelations<User>): Promise<User> {
    const { roles, ...restPayload } = payload;
    restPayload['createdBy'] = authUser;
    const queryRunner = await startTransaction(this.dataSource);

    let createdUser = null;

    try {
      const uniqueWhere = [
        ...(restPayload.email ? [{ email: restPayload.email }] : []),
        ...(restPayload.phoneNumber ? [{ phoneNumber: restPayload.phoneNumber }] : []),
      ];
      const matchingUsers = uniqueWhere.length
        ? await queryRunner.manager.find(User, { where: uniqueWhere, withDeleted: true })
        : [];
      const uniqueMatches = [...new Map(matchingUsers.map((user) => [user.id, user])).values()];
      if (uniqueMatches.length > 1) {
        throw new BadRequestException('User unique values belong to different records');
      }

      const existingUser = uniqueMatches[0];
      if (existingUser && !existingUser.isDeleted && !existingUser.deletedAt) {
        throw new BadRequestException('A user with this email, username, or phone number already exists');
      }

      createdUser = await queryRunner.manager.save(
        User,
        existingUser
          ? { ...existingUser, ...restPayload, isDeleted: false, deletedAt: null }
          : restPayload,
      );

      if (!createdUser) {
        throw new BadRequestException('User not created');
      }
      if (roles?.length) {
        for (const role of roles) {
          const roleData = await this.roleService.findOneBase({ id: role as any })
            ?? (Object.values(ENUM_ACL_DEFAULT_ROLES).includes(role as ENUM_ACL_DEFAULT_ROLES)
              ? await this.roleService.findOrCreateRole(role)
              : null);
          if (!roleData) {
            throw new BadRequestException(`Role not found: ${role}`);
          }
          const existingUserRole = await queryRunner.manager.findOne(UserRole, {
            where: { userId: createdUser.id, roleId: roleData.id },
            withDeleted: true,
          });
          if (existingUserRole) {
            await queryRunner.manager.update(
              UserRole,
              { id: existingUserRole.id },
              { isDeleted: false, deletedAt: null },
            );
          } else {
            await queryRunner.manager.save(
              Object.assign(new UserRole(), {
                userId: createdUser.id,
                roleId: roleData.id,
              }),
            );
          }
        }
      }
      await commitTransaction(queryRunner);
    } catch (error) {
      await rollbackTransaction(queryRunner);

      // Handle duplicate key errors with clearer messages
      const errorMessage = (error as Error).message || 'User not created';
      if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
        if (restPayload.email) {
          const existingEmail = await this.findOneIncludingDeleted({
            where: { email: restPayload.email },
          });
          if (existingEmail) {
            throw new BadRequestException('A user with this email already exists');
          }
        }
        if (restPayload.phoneNumber) {
          const existingPhone = await this.findOneIncludingDeleted({
            where: { phoneNumber: restPayload.phoneNumber },
          });
          if (existingPhone) {
            throw new BadRequestException('A user with this phone number already exists');
          }
        }
        throw new BadRequestException('A user with this email or phone number already exists');
      }
      throw new BadRequestException(errorMessage);
    }

    if (!createdUser) {
      throw new BadRequestException('User not created');
    }

    const updatedUser = await this.findOne({
      where: {
        id: createdUser.id,
      },
      relations,
    });

    return updatedUser;
  }

  async updateUser(
    id: string,
    payload: UpdateUserDTO,
    relations: FindOptionsRelations<User>,
  ): Promise<User> {
    await this.isExist({ id: id as any });

    // const { roles, ...userData } = payload;

    const queryRunner = await startTransaction(this.dataSource);

    try {
      if (isNotEmptyObject(payload)) {
        await queryRunner.manager.update(User, { id }, payload);
      }

      // if (roles && roles.length > 0) {
      //   const deletedItems = roles.filter((role) => role.isDeleted);
      //   const newOrUpdatedItems = roles.filter((role) => !role.isDeleted);

      //   await asyncForEach(deletedItems, async (role: UpdateRolesDTO) => {
      //     await this.userRoleService.isExist({
      //       userId: id,
      //       roleId: role.role,
      //     });
      //     await queryRunner.manager.delete(UserRole, {
      //       userId: id,
      //       roleId: role.role,
      //     });
      //   });

      //   await asyncForEach(newOrUpdatedItems, async (role: UpdateRolesDTO) => {
      //     const isRoleExist = await this.roleService.isExist({
      //       id: role.role,
      //     });
      //     const isUserRoleExist = await this.userRoleService.findOne({
      //       where: {
      //         userId: id,
      //         roleId: role.role,
      //       },
      //     });

      //     if (isUserRoleExist)
      //       throw new ConflictException(`User already has the ${isRoleExist?.title} role!`);
      //     else {
      //       await queryRunner.manager.save(
      //         Object.assign(new UserRole(), {
      //           userId: id,
      //           roleId: role.role,
      //         }),
      //       );
      //     }
      //   });
      // }

      await commitTransaction(queryRunner);
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'User not updated');
    }

    const updatedUser = await this.findOne({
      where: { id: id },
      relations,
    });

    return updatedUser;
  }

  async assignOrRemoveRole(
    id: string,
    payload: UserRoleAssignOrRemoveDTO,
    relations: FindOptionsRelations<User>,
  ): Promise<User> {
    await this.isExist({ id: id as any });
    const { roles } = payload;
    const queryRunner = await startTransaction(this.dataSource);
    try {
      if (roles && roles.length > 0) {
        const deletedItems = roles.filter((role) => role.isDeleted);
        const newOrUpdatedItems = roles.filter((role) => !role.isDeleted);

        await asyncForEach(deletedItems, async (role: UpdateRolesDTO) => {
          await this.userRoleService.isExist({
            userId: id,
            roleId: role.role,
          });
          // Soft-delete the user_role instead of hard-deleting it.
          // User roles are always active (default true), so set isDeleted = true.
          // Note: We use a direct queryRunner manager update because the userRoleService
          // doesn't expose a findOneByUserIdAndRoleId method. This is safe because we
          // just verified with isExist() that the row exists.
          await this._repo.manager.update(
            UserRole,
            { userId: id, roleId: role.role },
            { isDeleted: true, deletedAt: new Date() },
          );
        });

        await asyncForEach(newOrUpdatedItems, async (role: UpdateRolesDTO) => {
          const isRoleExist = await this.roleService.isExist({
            id: role.role,
          });
          const isUserRoleExist = await this.userRoleService.findOneIncludingDeleted({
            where: {
              userId: id,
              roleId: role.role,
            },
          });

          if (isUserRoleExist) {
            // Standard lookups include soft-deleted rows, so a previously removed
            // role looks present. Revive it instead of throwing a false conflict.
            if (isUserRoleExist.isDeleted) {
              await queryRunner.manager.update(
                UserRole,
                { userId: id, roleId: role.role },
                { isDeleted: false, deletedAt: null },
              );
            } else {
              throw new ConflictException(`User already has the ${isRoleExist?.title} role!`);
            }
          } else {
            await queryRunner.manager.save(
              Object.assign(new UserRole(), {
                userId: id,
                roleId: role.role,
              }),
            );
          }
        });
      }

      await commitTransaction(queryRunner);
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'User not updated');
    }

    const updatedUser = await this.findOne({ where: { id: id }, relations });
    return updatedUser;
  }

  async findOrCreateByPhoneNumber(phoneNumber: string, name: string, authUser?: IAuthUser): Promise<User> {
    const isExist = await this.findOneBase({ phoneNumber });

    if (isExist) {
      // console.warn("User exists with phone number:", phoneNumber);
      if (isExist?.fullName === 'Walking Customer' && name !== 'Walking Customer') {
        return this.updateOneBase(isExist.id, { fullName: name });
      }
      return isExist;
    } else {
      // console.warn("Creating new user with phone number:", phoneNumber);
      const user = await this.createOneBase({
        phoneNumber,
        fullName: name ?? null,
        password: generateStrongPassword(8),
        createdBy: authUser
      });

      // Don't auto-assign customer role - roles should be explicitly assigned
      return user;
    }
  }
}
