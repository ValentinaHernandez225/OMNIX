/**
 * Modulo: seguimientos.validator.js.
 * Responsabilidad: Esquemas de validacion: definen datos aceptados y restricciones antes de ejecutar la logica de negocio.
 */

import { body, param } from "express-validator";

export const validarSeguimiento = [
  param("id")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del ticket debe ser un entero positivo"
    ),

  body("observacion")
    .isString()
    .withMessage("La observación debe ser texto")
    .trim()
    .notEmpty()
    .withMessage("La observación es obligatoria")
    .isLength({ max: 2000 })
    .withMessage("Máximo 2000 caracteres")
];
