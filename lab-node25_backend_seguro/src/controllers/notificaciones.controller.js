/**
 * Modulo: notificaciones.controller.js.
 * Responsabilidad: Controladores HTTP: reciben datos de Express, llaman servicios y convierten resultados en respuestas HTTP.
 */

import * as servicio from "../services/notificaciones.service.js";// listar: lee parametros de la solicitud, delega la operacion al servicio y convierte el resultado en respuesta HTTP.
export async function listar(req, res, next) {
  try {
    const datos = await servicio.listarNotificaciones(
      req.usuario.id
    );

    return res.status(200).json(datos);
  } catch (error) {
    next(error);
  }
}// pendientes: lee parametros de la solicitud, delega la operacion al servicio y convierte el resultado en respuesta HTTP.
export async function pendientes(req, res, next) {
  try {
    const total = await servicio.contarPendientes(
      req.usuario.id
    );

    return res.status(200).json({
      pendientes: total,
    });
  } catch (error) {
    next(error);
  }
}// marcarLeida: lee parametros de la solicitud, delega la operacion al servicio y convierte el resultado en respuesta HTTP.
export async function marcarLeida(req, res, next) {
  try {
    const resultado = await servicio.marcarLeida(
      req.usuario.id,
      Number(req.params.id)
    );

    if (!resultado) {
      return res.status(404).json({
        error: "Notificación no encontrada",
      });
    }

    return res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
}
