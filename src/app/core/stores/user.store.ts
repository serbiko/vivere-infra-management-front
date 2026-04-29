import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap } from 'rxjs';
import { User, AuthTokens, Permission } from '../../shared/models/user.model';
import { AuthService } from '../auth/auth.service';

interface UserState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  tokens: null,
  isLoading: false,
  error: null,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user, tokens }) => ({
    isAuthenticated: computed(() => !!tokens()?.accessToken),
    fullName: computed(() => user()?.name ?? 'Convidado'),
    permissions: computed(() => user()?.permissions ?? []),
    isAdmin: computed(() => user()?.role === 'ADMIN'),
  })),
  withMethods((store, authService = inject(AuthService)) => ({
    // Método para fazer logout e limpar tudo
    logout(): void {
      patchState(store, initialState);
      localStorage.removeItem('vivere_tokens');
    },
    // Guarda os tokens (JWT) que o back-end enviar
    setTokens(tokens: AuthTokens): void {
      patchState(store, { tokens });
      localStorage.setItem('vivere_tokens', JSON.stringify(tokens));
    }
  })),
);