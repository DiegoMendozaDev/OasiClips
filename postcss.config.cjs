// postcss.config.cjs
module.exports = {
  plugins: {
    // El plugin PostCSS “oficial” para Tailwind (nuevo paquete).
    "@tailwindcss/postcss": {},
    // autoprefixer declarado como clave también funciona bien.
    autoprefixer: {},
  },
};
