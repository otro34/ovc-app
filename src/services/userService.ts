import { db } from './database';
import type { User } from './database';

export interface CreateUserRequest {
  username: string;
  password: string;
  email?: string;
  name?: string;
  role: 'admin' | 'user';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  name?: string;
  role?: 'admin' | 'user';
}

export class UserService {
  /**
   * Obtiene todos los usuarios
   */
  async getAllUsers(): Promise<User[]> {
    try {
      return await db.users.orderBy('createdAt').reverse().toArray();
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw new Error('Error al obtener la lista de usuarios');
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(id: number): Promise<User | null> {
    try {
      const user = await db.users.get(id);
      return user || null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw new Error('Error al obtener el usuario');
    }
  }

  /**
   * Obtiene un usuario por nombre de usuario
   */
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await db.users.where('username').equals(username).first();
      return user || null;
    } catch (error) {
      console.error('Error obteniendo usuario por username:', error);
      throw new Error('Error al obtener el usuario');
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      // Verificar que el username no exista
      const existingUser = await this.getUserByUsername(userData.username);
      if (existingUser) {
        throw new Error('El nombre de usuario ya existe');
      }

      // Validar datos
      const errors = this.validateUserData(userData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const newUser: Omit<User, 'id'> = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const id = await db.users.add(newUser);
      return { ...newUser, id };
    } catch (error) {
      console.error('Error creando usuario:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al crear el usuario');
    }
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        throw new Error('Usuario no encontrado');
      }

      // Si se está cambiando el username, verificar que no exista
      if (userData.username && userData.username !== existingUser.username) {
        const userWithSameUsername = await this.getUserByUsername(userData.username);
        if (userWithSameUsername) {
          throw new Error('El nombre de usuario ya existe');
        }
      }

      // Validar datos
      const errors = this.validateUserData(userData, true);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const updatedUser: User = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };

      await db.users.update(id, updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al actualizar el usuario');
    }
  }

  /**
   * Elimina un usuario
   */
  async deleteUser(id: number): Promise<void> {
    try {
      const user = await this.getUserById(id);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // No permitir eliminar al último admin
      if (user.role === 'admin') {
        const adminCount = await db.users.where('role').equals('admin').count();
        if (adminCount <= 1) {
          throw new Error('No se puede eliminar al último administrador del sistema');
        }
      }

      await db.users.delete(id);
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al eliminar el usuario');
    }
  }

  /**
   * Cambia la contraseña de un usuario
   */
  async changePassword(id: number, newPassword: string): Promise<void> {
    try {
      const user = await this.getUserById(id);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!newPassword || newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      await db.users.update(id, {
        password: newPassword,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al cambiar la contraseña');
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getUserStats(): Promise<{
    total: number;
    admins: number;
    users: number;
    recent: number; // usuarios creados en los últimos 30 días
  }> {
    try {
      const allUsers = await this.getAllUsers();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return {
        total: allUsers.length,
        admins: allUsers.filter(user => user.role === 'admin').length,
        users: allUsers.filter(user => user.role === 'user').length,
        recent: allUsers.filter(user =>
          user.createdAt && user.createdAt > thirtyDaysAgo
        ).length,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('Error al obtener las estadísticas de usuarios');
    }
  }

  /**
   * Busca usuarios por texto
   */
  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      if (!searchTerm.trim()) {
        return await this.getAllUsers();
      }

      const allUsers = await this.getAllUsers();
      const searchLower = searchTerm.toLowerCase();

      return allUsers.filter(user =>
        user.username.toLowerCase().includes(searchLower) ||
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error buscando usuarios:', error);
      throw new Error('Error al buscar usuarios');
    }
  }

  /**
   * Valida los datos del usuario
   */
  private validateUserData(data: CreateUserRequest | UpdateUserRequest, isUpdate = false): string[] {
    const errors: string[] = [];

    if (!isUpdate || data.username !== undefined) {
      if (!data.username || data.username.trim().length < 3) {
        errors.push('El nombre de usuario debe tener al menos 3 caracteres');
      }
      if (data.username && !/^[a-zA-Z0-9_]+$/.test(data.username)) {
        errors.push('El nombre de usuario solo puede contener letras, números y guiones bajos');
      }
    }

    if ('password' in data && data.password !== undefined) {
      if (!data.password || data.password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
      }
    }

    if (data.email && data.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('El formato del email no es válido');
      }
    }

    if (data.name && data.name.trim().length > 0 && data.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!isUpdate || data.role !== undefined) {
      if (!data.role || !['admin', 'user'].includes(data.role)) {
        errors.push('El rol debe ser admin o user');
      }
    }

    return errors;
  }
}

export const userService = new UserService();