const CURSOR_POINTER = ` py-2 px-5 w-full cursor-pointer `;

export const STYLE_INTERNAL = {
    primary: ` bg-rest-primary text-gray-400 hover:bg-rest-secondary hover:text-white ${CURSOR_POINTER}`,
    primaryRed: ` bg-rest-primary text-gray-400 hover:bg-rest-red hover:text-white ${CURSOR_POINTER}`,
    secondary: ` bg-rest-secondary text-rest-primary hover:bg-rest-secondary hover:text-white ${CURSOR_POINTER}`,
    red: ` bg-rest-red text-white ${CURSOR_POINTER}`,
    white: ` bg-white text-rest-primary w-full outline-1 outline-rest-primary ${CURSOR_POINTER}`,
    headerModalPrimary: `
  bg-gradient-to-r 
  from-rest-primary-down 
  via-rest-primary
  to-rest-primary-up
`,

confirmModalPrimary: `
  flex items-center gap-2
  justify-center
  px-4 py-2

  text-white

  bg-gradient-to-r 
  from-rest-primary-up 
  via-rest-primary
  to-rest-primary-down

  transition-all duration-300 ease-out

  hover:opacity-90
  active:opacity-80

  hover:scale-[1.02]
  active:scale-[0.98]

  ${CURSOR_POINTER}
`,
cancelModalRed: `
  flex items-center gap-2
  justify-center
  px-4 py-2

  text-white

  bg-gradient-to-r 
  from-rest-red-up 
  via-rest-red
  to-rest-red-down

  transition-all duration-300 ease-out

  hover:opacity-90
  active:opacity-80

  hover:scale-[1.02]
  active:scale-[0.98]

  ${CURSOR_POINTER}
`,

//   border-2 border-transparent
//   hover:bg-white 
//   hover:text-rest-red 
//   hover:border-rest-red

    // before: ` ${STYLE_ROOT.before} px-5 py-2 w-full `,
    // onlyPrimary: ` ${STYLE_ROOT.primary} `,

    // buttonBase: " inline-flex items-center justify-center transition-all active:scale-95 font-medium cursor-pointer",
    // button: " bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 ",
    // input: "w-full border-2 border-gray-100 p-2 rounded-md focus:border-blue-400 outline-none transition-colors"
};