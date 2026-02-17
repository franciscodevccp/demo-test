[
  {
    "schemaname": "public",
    "tablename": "customers",
    "policyname": "Usuarios autenticados pueden actualizar clientes",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "customers",
    "policyname": "Usuarios autenticados pueden crear clientes",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.role() = 'authenticated'::text)"
  },
  {
    "schemaname": "public",
    "tablename": "customers",
    "policyname": "Usuarios autenticados pueden eliminar clientes",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "customers",
    "policyname": "Usuarios autenticados pueden ver clientes",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() IS NOT NULL)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "diagnostics",
    "policyname": "diagnostics_insert",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "true"
  },
  {
    "schemaname": "public",
    "tablename": "diagnostics",
    "policyname": "diagnostics_select",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "diagnostics",
    "policyname": "diagnostics_update",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "notes",
    "policyname": "admins_can_view_all_notes",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND ((profiles.rol)::text = 'admin'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "notes",
    "policyname": "workers_can_create_own_notes",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(worker_id = auth.uid())"
  },
  {
    "schemaname": "public",
    "tablename": "notes",
    "policyname": "workers_can_delete_own_notes",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "DELETE",
    "qual": "(worker_id = auth.uid())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "notes",
    "policyname": "workers_can_update_own_notes",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(worker_id = auth.uid())",
    "with_check": "(worker_id = auth.uid())"
  },
  {
    "schemaname": "public",
    "tablename": "notes",
    "policyname": "workers_can_view_own_notes",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(worker_id = auth.uid())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "policyname": "Solo admins pueden actualizar perfiles",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(EXISTS ( SELECT 1\n   FROM profiles profiles_1\n  WHERE ((profiles_1.id = auth.uid()) AND ((profiles_1.rol)::text = 'admin'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "policyname": "Solo admins pueden crear perfiles",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM profiles profiles_1\n  WHERE ((profiles_1.id = auth.uid()) AND ((profiles_1.rol)::text = 'admin'::text))))"
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "policyname": "Usuarios autenticados pueden ver perfiles",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(auth.uid() IS NOT NULL)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "policyname": "Usuarios pueden actualizar su propio perfil",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(auth.uid() = id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "push_notification_tokens",
    "policyname": "Allow reading all tokens for notifications",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "push_notification_tokens",
    "policyname": "Users can delete their own tokens",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "push_notification_tokens",
    "policyname": "Users can insert their own tokens",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "push_notification_tokens",
    "policyname": "Users can update their own tokens",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(auth.uid() = user_id)",
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "service_expenses",
    "policyname": "admins_can_manage_expenses",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND ((profiles.rol)::text = 'admin'::text))))",
    "with_check": "(EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND ((profiles.rol)::text = 'admin'::text))))"
  },
  {
    "schemaname": "public",
    "tablename": "service_expenses",
    "policyname": "authenticated_can_view_expenses",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "service_parts",
    "policyname": "Usuarios autenticados pueden actualizar repuestos",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "service_parts",
    "policyname": "Usuarios autenticados pueden crear repuestos",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.role() = 'authenticated'::text)"
  },
  {
    "schemaname": "public",
    "tablename": "service_parts",
    "policyname": "Usuarios autenticados pueden eliminar repuestos",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "service_parts",
    "policyname": "Usuarios autenticados pueden ver repuestos",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "service_tasks",
    "policyname": "Usuarios autenticados pueden actualizar tareas",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "service_tasks",
    "policyname": "Usuarios autenticados pueden crear tareas",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.role() = 'authenticated'::text)"
  },
  {
    "schemaname": "public",
    "tablename": "service_tasks",
    "policyname": "Usuarios autenticados pueden eliminar tareas",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "service_tasks",
    "policyname": "Usuarios autenticados pueden ver tareas",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "service_worker_history",
    "policyname": "Usuarios autenticados pueden actualizar historial",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(auth.uid() IS NOT NULL)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "service_worker_history",
    "policyname": "Usuarios autenticados pueden crear historial",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() IS NOT NULL)"
  },
  {
    "schemaname": "public",
    "tablename": "service_worker_history",
    "policyname": "Usuarios autenticados pueden ver historial",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(auth.uid() IS NOT NULL)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "services",
    "policyname": "Usuarios autenticados pueden actualizar servicios",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "services",
    "policyname": "Usuarios autenticados pueden crear servicios",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.role() = 'authenticated'::text)"
  },
  {
    "schemaname": "public",
    "tablename": "services",
    "policyname": "Usuarios autenticados pueden eliminar servicios",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "services",
    "policyname": "Usuarios autenticados pueden ver servicios",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() IS NOT NULL)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "vehicles",
    "policyname": "Usuarios autenticados pueden actualizar vehículos",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "vehicles",
    "policyname": "Usuarios autenticados pueden crear vehículos",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.role() = 'authenticated'::text)"
  },
  {
    "schemaname": "public",
    "tablename": "vehicles",
    "policyname": "Usuarios autenticados pueden eliminar vehículos",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "vehicles",
    "policyname": "Usuarios autenticados pueden ver vehiculos",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() IS NOT NULL)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "vehicles",
    "policyname": "Usuarios autenticados pueden ver vehículos",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "worker_commissions",
    "policyname": "Admins can manage commissions",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND ((profiles.rol)::text = 'admin'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "worker_commissions",
    "policyname": "Users can view their own commissions",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((worker_id = auth.uid()) OR (EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND ((profiles.rol)::text = 'admin'::text)))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "worker_commissions",
    "policyname": "Workers can claim unassigned commissions",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "((worker_id IS NULL) AND (worker_role = (( SELECT profiles.rol\n   FROM profiles\n  WHERE (profiles.id = auth.uid())))::text))",
    "with_check": "(worker_id = auth.uid())"
  },
  {
    "schemaname": "public",
    "tablename": "worker_commissions",
    "policyname": "Workers can view unassigned commissions for their role",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "((worker_id IS NULL) AND (worker_role = (( SELECT profiles.rol\n   FROM profiles\n  WHERE (profiles.id = auth.uid())))::text))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "worker_panos",
    "policyname": "Admins can do everything on worker_panos",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND ((profiles.rol)::text = 'admin'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "worker_panos",
    "policyname": "Workers can insert their own panos",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() = worker_id)"
  },
  {
    "schemaname": "public",
    "tablename": "worker_panos",
    "policyname": "Workers can view all worker_panos",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  }
]