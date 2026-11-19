/**
 * Modulo: auth.validator.js.
 * Responsabilidad: Esquemas de validacion: definen datos aceptados y restricciones antes de ejecutar la logica de negocio.
 */

import { body } from "express-validator";


export const validarActualizarPerfil = [
  body("nombre").isString().withMessage("El nombre debe ser texto").bail().trim().isLength({ min: 1, max: 100 }).withMessage("El nombre debe tener entre 1 y 100 caracteres"),
  body("apellido").isString().withMessage("El apellido debe ser texto").bail().trim().isLength({ min: 1, max: 100 }).withMessage("El apellido debe tener entre 1 y 100 caracteres"),
  body("email").isEmail().withMessage("Correo electronico invalido").bail().isLength({ max: 150 }).withMessage("El correo no puede superar 150 caracteres").normalizeEmail(),
  body("tipo_documento").isIn(["CC", "TI", "CE", "PA", "PPT", "OTRO"]).withMessage("Tipo de documento invalido"),
  body("numero_documento").isString().withMessage("El documento debe ser texto").bail().trim().toUpperCase().matches(/^[A-Z0-9-]{4,30}$/).withMessage("El documento debe tener entre 4 y 30 caracteres alfanumericos o guiones"),
];

export const validarRecuperacion = [
  body("email")
    .isEmail()
    .withMessage("Correo electrónico inválido")
    .normalizeEmail(),
];

// ==========================================
// 1. VALIDACIÓN DE INICIO DE SESIÓN
// POST /api/auth/login
// ==========================================

export const validarLogin = [

  // Validar correo electrónico.
  body("email")
    .isEmail()
    .withMessage("Correo electrónico inválido")
    .normalizeEmail(),

  // Validar contraseña.
  body("password")
    .isString()
    .withMessage("La contraseña debe ser texto")
    .bail()
    .notEmpty()
    .withMessage("La contraseña es obligatoria")

];

// ==========================================
// 2. VALIDACIÓN DE CAMBIO DE CONTRASEÑA
// PATCH /api/auth/cambiar-password
// ==========================================

export const validarCambioPassword = [

  // ======================================
  // 2.1 VALIDAR CONTRASEÑA ACTUAL
  // ======================================

  body("passwordActual")
    .isString()
    .withMessage("La contraseña actual debe ser texto")
    .bail()
    .notEmpty()
    .withMessage("La contraseña actual es obligatoria"),

  // ======================================
  // 2.2 VALIDAR NUEVA CONTRASEÑA
  // ======================================

  body("passwordNueva")
    .isString()
    .withMessage("La nueva contraseña debe ser texto")
    .bail()
    .isLength({ min: 12, max: 128 })
    .withMessage(
      "La nueva contraseña debe tener entre 12 y 128 caracteres"
    ),

  // ======================================
  // 2.3 IMPEDIR REUTILIZACIÓN
  // ======================================

  body("passwordNueva")
    .custom((valor, { req }) => {

      if (valor === req.body.passwordActual) {
        throw new Error(
          "La contraseña nueva debe ser diferente"
        );
      }

      return true;
    })

];
