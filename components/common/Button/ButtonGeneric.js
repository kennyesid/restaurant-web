import React from 'react'
import { STYLE_INTERNAL } from '@/lib/constants/constantStyle';
// import { STYLE_ROOT } from '@/styles/styleGeneric'
// import { STYLE_INTERNAL } from '@/styles/styleInternal';

// export const STYLE_ROOT = {
//     primary: " bg-rest-primary text-rest-gray hover:bg-rest-secondary hover:text-white  ",
//     before: " bg-rest-yellow text-rest-gray hover:bg-rest-secondary hover:text-white ",
//     card: " bg-white rounded-odont-radius p-6 shadow-sm border border-gray-100 ",

//     // Títulos genéricos
//     title: " text-2xl font-bold text-odont-primary ",

//     // Botones que llamarás como funciones/clases
//     button: " bg-odont-primary text-white px-5 py-2 rounded-lg hover:bg-odont-secondary transition-all active:scale-95 font-medium ",

//     // Inputs estándar
//     input: " w-full border-2 border-gray-100 p-2 rounded-md focus:border-odont-secondary outline-none transition-colors ",
//     roundedPanelMain: " rounded-3xl ",
//     navbarButton: " bg-odont-primary text-odont-skyblue hover:bg-odont-secondary hover:text-white rounded-2xl "
// };

// export const STYLE_INTERNAL = {
//     primary: ` bg-rest-primary text-gray-400 hover:bg-rest-secondary hover:text-white px-5 py-2 w-full `,
//     secondary: ` bg-rest-secondary text-rest-primary hover:bg-rest-secondary hover:text-white px-5 py-2 w-full `,

//     before: ` ${STYLE_ROOT.before} px-5 py-2 w-full `,
//     onlyPrimary: ` ${STYLE_ROOT.primary} `,

//     buttonBase: " inline-flex items-center justify-center transition-all active:scale-95 font-medium cursor-pointer",
//     button: " bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 ",
//     input: "w-full border-2 border-gray-100 p-2 rounded-md focus:border-blue-400 outline-none transition-colors"
// };

const ButtonGeneric = ({
    as: Component = 'button',
    variant = 'button',
    className = '',
    children,
    disabled = false,
    ...props
}) => {
    const combinedClasses = `
    ${STYLE_INTERNAL[variant] || ''} 
    ${STYLE_INTERNAL.buttonBase || ''} 
    ${className}
    ${disabled ? 'transition-opacity opacity-50' : ''}
  `.trim().replace(/\s+/g, ' ');

    return (
        <Component
            className={combinedClasses}
            disabled={disabled}
            {...props}
        >
            {children}
        </Component>
    );
}

export default ButtonGeneric