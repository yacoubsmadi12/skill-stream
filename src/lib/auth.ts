export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  employeeId: string;
  name: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  admin: {
    password: 'admin123',
    user: {
      id: '1',
      employeeId: 'admin',
      name: 'System Administrator',
      role: 'admin',
      department: 'IT',
      avatar: '',
    },
  },
  user1: {
    password: 'user123',
    user: {
      id: '2',
      employeeId: 'user1',
      name: 'Ahmed Al-Rashid',
      role: 'user',
      department: 'Engineering',
      avatar: '',
    },
  },
  user2: {
    password: 'user123',
    user: {
      id: '3',
      employeeId: 'user2',
      name: 'Sara Mohammed',
      role: 'user',
      department: 'Sales',
      avatar: '',
    },
  },
  user3: {
    password: 'user123',
    user: {
      id: '4',
      employeeId: 'user3',
      name: 'Khalid Nasser',
      role: 'user',
      department: 'AI & Data',
      avatar: '',
    },
  },
};

export async function authenticateLDAP(
  employeeId: string,
  password: string
): Promise<AuthUser | null> {
  // Simulate LDAP delay
  await new Promise((r) => setTimeout(r, 800));

  const entry = MOCK_USERS[employeeId];
  if (entry && entry.password === password) {
    return entry.user;
  }
  return null;
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('ztube_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeUser(user: AuthUser) {
  localStorage.setItem('ztube_user', JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem('ztube_user');
}
