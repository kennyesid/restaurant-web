"use client";

import { ReactNode } from "react";
import { useAppSelector } from "@/store/store/hooks";

interface RoleGuardProps {
    allowedRoles: string | string[];
    children: ReactNode;
    fallback?: ReactNode;
}

export default function RoleGuard({
    allowedRoles,
    children,
    fallback = null
}: RoleGuardProps) {
    const { user } = useAppSelector((state) => state.auth);
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const userRole = user?.role?.toUpperCase() || "";
    const hasPermission = rolesArray.some(
        (role) => role.toUpperCase() === userRole
    );
    return hasPermission ? <>{children}</> : <>{fallback}</>;
}