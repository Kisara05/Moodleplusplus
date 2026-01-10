export const PERMISSIONS = {
  course: {
    create: ["admin"],
    edit: ["admin"],
    delete: ["admin"],
    view: ["student", "teacher", "admin"],
  },
  user: {
    create: ["admin"],
    edit: ["admin"],
    delete: ["admin"],
    view: ["admin"],
  },
  enrollment: {
    create: ["student", "teacher", "admin"],
    delete: ["admin"],
  },
} as const;

export function canAccess(userRole: string, resource: string, action: string) {
  const permission =
    PERMISSIONS[resource as keyof typeof PERMISSIONS]?.[
      action as keyof (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
    ];
  return (permission as readonly string[])?.includes(userRole as "admin" | "student" | "teacher") ?? false;
}
