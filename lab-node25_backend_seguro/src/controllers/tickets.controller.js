/**
 * Modulo: tickets.controller.js.
 * Responsabilidad: Controladores HTTP: reciben datos de Express, llaman servicios y convierten resultados en respuestas HTTP.
 */

import * as service from "../services/tickets.service.js";

// ==========================================
// NEXDESK - LAB NODE 26
// CONTROLADOR DE TICKETS
// ==========================================

export async function listar(req, res, next) {
  try {
    const tickets = await service.listarTickets(
      req.query.estado,
      req.usuario
    );

    return res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
}// obtener: lee parametros de la solicitud, delega la operacion al servicio y convierte el resultado en respuesta HTTP.
export async function obtener(req, res, next) {
  try {
    const ticket = await service.obtenerTicket(
      req.params.id
    );

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket no encontrado"
      });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
}// crear: lee parametros de la solicitud, delega la operacion al servicio y convierte el resultado en respuesta HTTP.
export async function crear(req, res, next) {
  try {
    const datos = {
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      prioridad: req.body.prioridad,
      categoria_id: req.body.categoria_id,

      // Identidad recuperada del JWT.
      usuario_id: req.usuario.id
    };

    const ticket = await service.crearTicket(datos);

    return res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
}// asignar: lee parametros de la solicitud, delega la operacion al servicio y convierte el resultado en respuesta HTTP.
export async function asignar(req, res, next) {
  try {
    const ticket = await service.asignarTecnico(
      req.params.id,
      req.body.tecnico_id
    );

    if (!ticket) {
      return res.status(409).json({
        error:
          "Ticket no asignable o técnico no disponible"
      });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
}// cambiarEstado: lee parametros de la solicitud, delega la operacion al servicio y convierte el resultado en respuesta HTTP.
export async function cambiarEstado(req, res, next) {
  try {
    const ticket = await service.cambiarEstado(
      req.params.id,
      req.body.estado,
      req.body.solucion,
      req.usuario
    );

    return res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
}
