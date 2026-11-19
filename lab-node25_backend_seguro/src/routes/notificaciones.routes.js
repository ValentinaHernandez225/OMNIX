/**
 * Modulo: notificaciones.routes.js.
 * Responsabilidad: Rutas HTTP: conectan metodo y URL con validacion, autenticacion, autorizacion y controlador.
 */

import { Router } from "express";

import * as controller from
  "../controllers/notificaciones.controller.js";

const router = Router();

// GET /api/notificaciones
router.get("/", controller.listar);

// GET /api/notificaciones/pendientes
router.get("/pendientes", controller.pendientes);

// PATCH /api/notificaciones/:id/leida
router.patch(
  "/:id/leida",
  (req, res, next) => {
    const id = req.params.id;

    if (
      !/^[1-9]\d*$/.test(id) ||
      !Number.isSafeInteger(Number(id))
    ) {
      return res.status(400).json({
        error: "ID de notificación inválido",
      });
    }

    next();
  },
  controller.marcarLeida
);

export default router;
