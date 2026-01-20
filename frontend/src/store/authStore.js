/**
 * Store de autenticación con Zustand
 * Gestión global del estado de autenticación
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Acciones
      login: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      updateUser: (userData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
      },
      
      // Verificadores
      isAdmin: () => {
        const user = get().user;
        return user && user.rol === 'admin';
      },
      
      isTesorero: () => {
        const user = get().user;
        return user && (user.rol === 'admin' || user.rol === 'tesorero');
      },
      
      isCoordinador: () => {
        const user = get().user;
        return user && (user.rol === 'admin' || user.rol === 'coordinador');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
