import React, { ElementType, ReactNode } from "react";
import { STYLE_INTERNAL } from "@/lib/constants/constantStyle";

// 1. Tipamos las variantes disponibles basándonos en tus constantes reales
type ButtonVariant = keyof typeof STYLE_INTERNAL;

// 2. Definimos las props base
interface ButtonGenericProps<E extends ElementType> {
  as?: E;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
}

// 3. Unimos con las props nativas del elemento (HTML)
type Props<E extends ElementType> = ButtonGenericProps<E> &
  Omit<React.ComponentPropsWithoutRef<E>, keyof ButtonGenericProps<E>>;

export const ButtonGeneric = <E extends ElementType = "button">({
  as,
  variant = "primary", // Cambié 'button' por 'primary' para que coincida con tus constantes
  className = "",
  children,
  disabled = false,
  ...props
}: Props<E>) => {
  // Usamos una mayúscula para que React lo reconozca como componente
  const Tag = as || "button";

  const combinedClasses = `
    ${STYLE_INTERNAL[variant as ButtonVariant] || ""} 
    ${className}
    ${disabled ? "transition-opacity opacity-50 cursor-not-allowed pointer-events-none " : ""}
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <Tag
      className={combinedClasses}
      disabled={Tag === "button" ? disabled : undefined}
      onClick={(e: React.MouseEvent) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // @ts-ignore
        props.onClick?.(e);
      }}
      {...props}
    >
      {children}
    </Tag>
    // <Tag className={combinedClasses} disabled={disabled} {...props}>
    //   {children}
    // </Tag>
  );
};

export default ButtonGeneric;

// import React from 'react'
// import { STYLE_INTERNAL } from '@/lib/constants/constantStyle';

// const ButtonGeneric = ({
//     as: Component = 'button',
//     variant = 'button',
//     className = '',
//     children,
//     disabled = false,
//     ...props
// }) => {
//     const combinedClasses = `
//     ${STYLE_INTERNAL[variant] || ''}
//     ${STYLE_INTERNAL.buttonBase || ''}
//     ${className}
//     ${disabled ? 'transition-opacity opacity-50' : ''}
//   `.trim().replace(/\s+/g, ' ');

//     return (
//         <Component
//             className={combinedClasses}
//             disabled={disabled}
//             {...props}
//         >
//             {children}
//         </Component>
//     );
// }

// export default ButtonGeneric
