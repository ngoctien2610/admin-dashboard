import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:3002/api';

export interface PermissionDefinition { key: string; label: string; group: string }
export interface RbacData { roles: Record<string, string[]>; permissions: PermissionDefinition[] }

export function useRbac(roleOverride?: string) {
  const [storedRole, setStoredRole] = useState(() => window.localStorage.getItem('adminRole') || 'Admin');
  const role = roleOverride || storedRole;
  const [data, setData] = useState<RbacData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleOverride) window.localStorage.setItem('adminRole', storedRole);
  }, [roleOverride, storedRole]);

  useEffect(() => {
    fetch(`${API_BASE}/rbac`).then((response) => {
      if (!response.ok) throw new Error('Không thể tải quyền');
      return response.json();
    }).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  const can = (permission: string) => Boolean(data?.roles?.[role]?.includes(permission));
  return { role, setRole: setStoredRole, data, loading, can };
}
