import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoPago {
  id: number;
  tipoPagoNombre: string;
  createdAt: string;
  updatedAt: string;
}

export interface TipoPagoPayload {
  tipoPagoNombre: string;
}

export interface EstadoVenta {
  id: number;
  nombre: string;
  createdAt: string;
  updatedAt: string;
}

export interface EstadoVentaPayload {
  nombre: string;
}

export interface CategoriaProducto {
  id: number;
  categoriaProductoNombre: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriaProductoPayload {
  categoriaProductoNombre: string;
}

export interface Proveedor {
  id: number;
  nombreApellidos: string;
  proveedorTelefono?: string | null;
  proveedorDireccion?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProveedorPayload {
  nombreApellidos: string;
  proveedorTelefono?: string | null;
  proveedorDireccion?: string | null;
}

export interface ReferenciaDto {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  productoNombre: string;
  descripcion?: string | null;
  productoImg?: string | null;
  cantidad: number;
  precio: number;
  precioVenta: number;
  fechaAdquisicion?: string | null;
  createdAt: string;
  updatedAt: string;
  proveedor: ReferenciaDto;
  categoriaProducto: ReferenciaDto;
}

export interface ProductoPayload {
  productoNombre: string;
  descripcion?: string | null;
  productoImg?: string | null;
  cantidad: number;
  precio: number;
  precioVenta: number;
  fechaAdquisicion?: string | null;
  proveedorId: number;
  categoriaProductoId: number;
}

export interface Venta {
  id: number;
  beneficiarioNombre: string;
  beneficiarioTelefono?: string | null;
  beneficiarioDireccion?: string | null;
  cantidadVenta: number;
  conDomicilio: boolean;
  fechaVenta: string;
  fechaPago?: string | null;
  fechaLiquidacion?: string | null;
  createdAt: string;
  updatedAt: string;
  producto: ReferenciaDto;
  tipoPago: ReferenciaDto;
  estadoVenta: ReferenciaDto;
}

export interface VentaPayload {
  beneficiarioNombre: string;
  beneficiarioTelefono?: string | null;
  beneficiarioDireccion?: string | null;
  productoId: number;
  cantidadVenta: number;
  conDomicilio: boolean;
  estadoVentaId: number;
  fechaVenta: string;
  fechaPago?: string | null;
  fechaLiquidacion?: string | null;
  tipoPagoId: number;
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  // Cambia esta URL según tu backend
  private readonly apiUrl = 'http://localhost:5297/api';

  constructor(private http: HttpClient) {}

  // =========================
  // TipoPagos
  // =========================
  getTipoPagos(): Observable<TipoPago[]> {
    return this.http.get<TipoPago[]>(`${this.apiUrl}/TipoPagos`);
  }

  getTipoPagoById(id: number): Observable<TipoPago> {
    return this.http.get<TipoPago>(`${this.apiUrl}/TipoPagos/${id}`);
  }

  createTipoPago(payload: TipoPagoPayload): Observable<TipoPago> {
    return this.http.post<TipoPago>(`${this.apiUrl}/TipoPagos`, payload);
  }

  updateTipoPago(id: number, payload: TipoPagoPayload): Observable<TipoPago> {
    return this.http.put<TipoPago>(`${this.apiUrl}/TipoPagos/${id}`, payload);
  }

  deleteTipoPago(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/TipoPagos/${id}`);
  }

  // =========================
  // EstadoVentas
  // =========================
  getEstadoVentas(): Observable<EstadoVenta[]> {
    return this.http.get<EstadoVenta[]>(`${this.apiUrl}/EstadoVentas`);
  }

  getEstadoVentaById(id: number): Observable<EstadoVenta> {
    return this.http.get<EstadoVenta>(`${this.apiUrl}/EstadoVentas/${id}`);
  }

  createEstadoVenta(payload: EstadoVentaPayload): Observable<EstadoVenta> {
    return this.http.post<EstadoVenta>(`${this.apiUrl}/EstadoVentas`, payload);
  }

  updateEstadoVenta(id: number, payload: EstadoVentaPayload): Observable<EstadoVenta> {
    return this.http.put<EstadoVenta>(`${this.apiUrl}/EstadoVentas/${id}`, payload);
  }

  deleteEstadoVenta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/EstadoVentas/${id}`);
  }

  // =========================
  // CategoriaProductos
  // =========================
  getCategoriaProductos(): Observable<CategoriaProducto[]> {
    return this.http.get<CategoriaProducto[]>(`${this.apiUrl}/CategoriaProductos`);
  }

  getCategoriaProductoById(id: number): Observable<CategoriaProducto> {
    return this.http.get<CategoriaProducto>(`${this.apiUrl}/CategoriaProductos/${id}`);
  }

  createCategoriaProducto(payload: CategoriaProductoPayload): Observable<CategoriaProducto> {
    return this.http.post<CategoriaProducto>(`${this.apiUrl}/CategoriaProductos`, payload);
  }

  updateCategoriaProducto(id: number, payload: CategoriaProductoPayload): Observable<CategoriaProducto> {
    return this.http.put<CategoriaProducto>(`${this.apiUrl}/CategoriaProductos/${id}`, payload);
  }

  deleteCategoriaProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/CategoriaProductos/${id}`);
  }

  // =========================
  // Proveedores
  // =========================
  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/Proveedores`);
  }

  getProveedorById(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/Proveedores/${id}`);
  }

  createProveedor(payload: ProveedorPayload): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.apiUrl}/Proveedores`, payload);
  }

  updateProveedor(id: number, payload: ProveedorPayload): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/Proveedores/${id}`, payload);
  }

  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Proveedores/${id}`);
  }

  // =========================
  // Productos
  // =========================
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/Productos`);
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/Productos/${id}`);
  }

  createProducto(payload: ProductoPayload): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/Productos`, payload);
  }

  updateProducto(id: number, payload: ProductoPayload): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/Productos/${id}`, payload);
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Productos/${id}`);
  }

  // =========================
  // Ventas
  // =========================
  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}/Ventas`);
  }

  getVentaById(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/Ventas/${id}`);
  }

  createVenta(payload: VentaPayload): Observable<Venta> {
    return this.http.post<Venta>(`${this.apiUrl}/Ventas`, payload);
  }

  updateVenta(id: number, payload: VentaPayload): Observable<Venta> {
    return this.http.put<Venta>(`${this.apiUrl}/Ventas/${id}`, payload);
  }

  deleteVenta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Ventas/${id}`);
  }
}
