import { CommonModule } from '@angular/common';
import { Component, computed, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';
import {
  CategoriaProducto,
  CategoriaProductoPayload,
  EstadoVenta,
  EstadoVentaPayload,
  Producto,
  ProductoPayload,
  Proveedor,
  ProveedorPayload,
  TipoPago,
  TipoPagoPayload,
  Venta,
  VentaPayload,
  VentasService
} from '../../../services/ventas.service';

type TabKey =
  | 'tipoPagos'
  | 'estadoVentas'
  | 'categoriaProductos'
  | 'proveedores'
  | 'productos'
  | 'ventas';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent {
  private readonly ventasService = inject(VentasService);

  private readonly activeTabState = signal<TabKey>('tipoPagos');
  private readonly loadingState = signal(false);
  private readonly messageState = signal('');
  private readonly messageTypeState = signal<'success' | 'error' | ''>('');

  private readonly editingTipoPagoIdState = signal<number | null>(null);
  private readonly editingEstadoVentaIdState = signal<number | null>(null);
  private readonly editingCategoriaProductoIdState = signal<number | null>(null);
  private readonly editingProveedorIdState = signal<number | null>(null);
  private readonly editingProductoIdState = signal<number | null>(null);
  private readonly editingVentaIdState = signal<number | null>(null);

  readonly tipoPagosResource = resource({ loader: () => firstValueFrom(this.ventasService.getTipoPagos()) });
  readonly estadoVentasResource = resource({ loader: () => firstValueFrom(this.ventasService.getEstadoVentas()) });
  readonly categoriaProductosResource = resource({ loader: () => firstValueFrom(this.ventasService.getCategoriaProductos()) });
  readonly proveedoresResource = resource({ loader: () => firstValueFrom(this.ventasService.getProveedores()) });
  readonly productosResource = resource({ loader: () => firstValueFrom(this.ventasService.getProductos()) });
  readonly ventasResource = resource({ loader: () => firstValueFrom(this.ventasService.getVentas()) });

  readonly hasAnyLoadingResource = computed(
    () =>
      this.tipoPagosResource.isLoading() ||
      this.estadoVentasResource.isLoading() ||
      this.categoriaProductosResource.isLoading() ||
      this.proveedoresResource.isLoading() ||
      this.productosResource.isLoading() ||
      this.ventasResource.isLoading()
  );

  get activeTab(): TabKey {
    return this.activeTabState();
  }

  get loading(): boolean {
    return this.loadingState() || this.hasAnyLoadingResource();
  }

  get message(): string {
    return this.messageState();
  }

  get messageType(): 'success' | 'error' | '' {
    return this.messageTypeState();
  }

  get tipoPagos(): TipoPago[] {
    return this.tipoPagosResource.value() ?? [];
  }

  get estadoVentas(): EstadoVenta[] {
    return this.estadoVentasResource.value() ?? [];
  }

  get categoriaProductos(): CategoriaProducto[] {
    return this.categoriaProductosResource.value() ?? [];
  }

  get proveedores(): Proveedor[] {
    return this.proveedoresResource.value() ?? [];
  }

  get productos(): Producto[] {
    return this.productosResource.value() ?? [];
  }

  get ventas(): Venta[] {
    return this.ventasResource.value() ?? [];
  }

  get editingTipoPagoId(): number | null {
    return this.editingTipoPagoIdState();
  }

  get editingEstadoVentaId(): number | null {
    return this.editingEstadoVentaIdState();
  }

  get editingCategoriaProductoId(): number | null {
    return this.editingCategoriaProductoIdState();
  }

  get editingProveedorId(): number | null {
    return this.editingProveedorIdState();
  }

  get editingProductoId(): number | null {
    return this.editingProductoIdState();
  }

  get editingVentaId(): number | null {
    return this.editingVentaIdState();
  }

  tipoPagoForm: TipoPagoPayload = { tipoPagoNombre: '' };
  estadoVentaForm: EstadoVentaPayload = { nombre: '' };
  categoriaProductoForm: CategoriaProductoPayload = { categoriaProductoNombre: '' };
  proveedorForm: ProveedorPayload = {
    nombreApellidos: '',
    proveedorTelefono: '',
    proveedorDireccion: ''
  };
  productoForm: ProductoPayload = {
    productoNombre: '',
    descripcion: '',
    productoImg: '',
    cantidad: 0,
    precio: 0,
    precioVenta: 0,
    fechaAdquisicion: '',
    proveedorId: 0,
    categoriaProductoId: 0
  };
  ventaForm: VentaPayload = {
    beneficiarioNombre: '',
    beneficiarioTelefono: '',
    beneficiarioDireccion: '',
    productoId: 0,
    cantidadVenta: 0,
    conDomicilio: false,
    estadoVentaId: 0,
    fechaVenta: '',
    fechaPago: '',
    fechaLiquidacion: '',
    tipoPagoId: 0
  };

  setTab(tab: TabKey): void {
    this.activeTabState.set(tab);
  }

  showSuccess(message: string): void {
    this.messageState.set(message);
    this.messageTypeState.set('success');
    setTimeout(() => {
      if (this.messageState() === message) this.clearMessage();
    }, 3000);
  }

  showError(message: string): void {
    this.messageState.set(message);
    this.messageTypeState.set('error');
    setTimeout(() => {
      if (this.messageState() === message) this.clearMessage();
    }, 4000);
  }

  clearMessage(): void {
    this.messageState.set('');
    this.messageTypeState.set('');
  }

  handleError(error: unknown, fallbackMessage: string): void {
    console.error(error);
    const backendMessage = (error as { error?: { message?: string } })?.error?.message;
    this.showError(backendMessage || fallbackMessage);
  }

  loadAllData(): void {
    this.tipoPagosResource.reload();
    this.estadoVentasResource.reload();
    this.categoriaProductosResource.reload();
    this.proveedoresResource.reload();
    this.productosResource.reload();
    this.ventasResource.reload();
  }

  loadTipoPagos(): void {
    this.tipoPagosResource.reload();
  }

  loadEstadoVentas(): void {
    this.estadoVentasResource.reload();
  }

  loadCategoriaProductos(): void {
    this.categoriaProductosResource.reload();
  }

  loadProveedores(): void {
    this.proveedoresResource.reload();
  }

  loadProductos(): void {
    this.productosResource.reload();
  }

  loadVentas(): void {
    this.ventasResource.reload();
  }

  async submitTipoPago(): Promise<void> {
    if (!this.tipoPagoForm.tipoPagoNombre.trim()) {
      this.showError('El nombre del tipo de pago es obligatorio.');
      return;
    }

    await this.runMutation(
      () =>
        this.editingTipoPagoId
          ? this.ventasService.updateTipoPago(this.editingTipoPagoId, this.tipoPagoForm)
          : this.ventasService.createTipoPago(this.tipoPagoForm),
      this.editingTipoPagoId ? 'Tipo de pago actualizado correctamente.' : 'Tipo de pago creado correctamente.',
      this.editingTipoPagoId ? 'No se pudo actualizar el tipo de pago.' : 'No se pudo crear el tipo de pago.',
      () => {
        this.resetTipoPagoForm();
        this.loadTipoPagos();
      }
    );
  }

  editTipoPago(item: TipoPago): void {
    this.editingTipoPagoIdState.set(item.id);
    this.tipoPagoForm = { tipoPagoNombre: item.tipoPagoNombre };
    this.setTab('tipoPagos');
  }

  async deleteTipoPago(id: number): Promise<void> {
    if (!confirm('¿Seguro que deseas eliminar este tipo de pago?')) return;

    await this.runMutation(
      () => this.ventasService.deleteTipoPago(id),
      'Tipo de pago eliminado correctamente.',
      'No se pudo eliminar el tipo de pago.',
      () => {
        if (this.editingTipoPagoId === id) this.resetTipoPagoForm();
        this.loadTipoPagos();
      }
    );
  }

  resetTipoPagoForm(): void {
    this.editingTipoPagoIdState.set(null);
    this.tipoPagoForm = { tipoPagoNombre: '' };
  }

  async submitEstadoVenta(): Promise<void> {
    if (!this.estadoVentaForm.nombre.trim()) {
      this.showError('El nombre del estado de venta es obligatorio.');
      return;
    }

    await this.runMutation(
      () =>
        this.editingEstadoVentaId
          ? this.ventasService.updateEstadoVenta(this.editingEstadoVentaId, this.estadoVentaForm)
          : this.ventasService.createEstadoVenta(this.estadoVentaForm),
      this.editingEstadoVentaId ? 'Estado de venta actualizado correctamente.' : 'Estado de venta creado correctamente.',
      this.editingEstadoVentaId ? 'No se pudo actualizar el estado de venta.' : 'No se pudo crear el estado de venta.',
      () => {
        this.resetEstadoVentaForm();
        this.loadEstadoVentas();
      }
    );
  }

  editEstadoVenta(item: EstadoVenta): void {
    this.editingEstadoVentaIdState.set(item.id);
    this.estadoVentaForm = { nombre: item.nombre };
    this.setTab('estadoVentas');
  }

  async deleteEstadoVenta(id: number): Promise<void> {
    if (!confirm('¿Seguro que deseas eliminar este estado de venta?')) return;

    await this.runMutation(
      () => this.ventasService.deleteEstadoVenta(id),
      'Estado de venta eliminado correctamente.',
      'No se pudo eliminar el estado de venta.',
      () => {
        if (this.editingEstadoVentaId === id) this.resetEstadoVentaForm();
        this.loadEstadoVentas();
      }
    );
  }

  resetEstadoVentaForm(): void {
    this.editingEstadoVentaIdState.set(null);
    this.estadoVentaForm = { nombre: '' };
  }

  async submitCategoriaProducto(): Promise<void> {
    if (!this.categoriaProductoForm.categoriaProductoNombre.trim()) {
      this.showError('El nombre de la categoría es obligatorio.');
      return;
    }

    await this.runMutation(
      () =>
        this.editingCategoriaProductoId
          ? this.ventasService.updateCategoriaProducto(this.editingCategoriaProductoId, this.categoriaProductoForm)
          : this.ventasService.createCategoriaProducto(this.categoriaProductoForm),
      this.editingCategoriaProductoId ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.',
      this.editingCategoriaProductoId ? 'No se pudo actualizar la categoría.' : 'No se pudo crear la categoría.',
      () => {
        this.resetCategoriaProductoForm();
        this.loadCategoriaProductos();
      }
    );
  }

  editCategoriaProducto(item: CategoriaProducto): void {
    this.editingCategoriaProductoIdState.set(item.id);
    this.categoriaProductoForm = { categoriaProductoNombre: item.categoriaProductoNombre };
    this.setTab('categoriaProductos');
  }

  async deleteCategoriaProducto(id: number): Promise<void> {
    if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;

    await this.runMutation(
      () => this.ventasService.deleteCategoriaProducto(id),
      'Categoría eliminada correctamente.',
      'No se pudo eliminar la categoría.',
      () => {
        if (this.editingCategoriaProductoId === id) this.resetCategoriaProductoForm();
        this.loadCategoriaProductos();
      }
    );
  }

  resetCategoriaProductoForm(): void {
    this.editingCategoriaProductoIdState.set(null);
    this.categoriaProductoForm = { categoriaProductoNombre: '' };
  }

  async submitProveedor(): Promise<void> {
    if (!this.proveedorForm.nombreApellidos.trim()) {
      this.showError('El nombre del proveedor es obligatorio.');
      return;
    }

    await this.runMutation(
      () =>
        this.editingProveedorId
          ? this.ventasService.updateProveedor(this.editingProveedorId, this.proveedorForm)
          : this.ventasService.createProveedor(this.proveedorForm),
      this.editingProveedorId ? 'Proveedor actualizado correctamente.' : 'Proveedor creado correctamente.',
      this.editingProveedorId ? 'No se pudo actualizar el proveedor.' : 'No se pudo crear el proveedor.',
      () => {
        this.resetProveedorForm();
        this.loadProveedores();
      }
    );
  }

  editProveedor(item: Proveedor): void {
    this.editingProveedorIdState.set(item.id);
    this.proveedorForm = {
      nombreApellidos: item.nombreApellidos,
      proveedorTelefono: item.proveedorTelefono || '',
      proveedorDireccion: item.proveedorDireccion || ''
    };
    this.setTab('proveedores');
  }

  async deleteProveedor(id: number): Promise<void> {
    if (!confirm('¿Seguro que deseas eliminar este proveedor?')) return;

    await this.runMutation(
      () => this.ventasService.deleteProveedor(id),
      'Proveedor eliminado correctamente.',
      'No se pudo eliminar el proveedor.',
      () => {
        if (this.editingProveedorId === id) this.resetProveedorForm();
        this.loadProveedores();
      }
    );
  }

  resetProveedorForm(): void {
    this.editingProveedorIdState.set(null);
    this.proveedorForm = {
      nombreApellidos: '',
      proveedorTelefono: '',
      proveedorDireccion: ''
    };
  }

  async submitProducto(): Promise<void> {
    if (!this.productoForm.productoNombre.trim()) {
      this.showError('El nombre del producto es obligatorio.');
      return;
    }

    if (!this.productoForm.proveedorId || !this.productoForm.categoriaProductoId) {
      this.showError('Debes seleccionar proveedor y categoría.');
      return;
    }

    const payload: ProductoPayload = {
      ...this.productoForm,
      fechaAdquisicion: this.productoForm.fechaAdquisicion || null
    };

    await this.runMutation(
      () =>
        this.editingProductoId
          ? this.ventasService.updateProducto(this.editingProductoId, payload)
          : this.ventasService.createProducto(payload),
      this.editingProductoId ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.',
      this.editingProductoId ? 'No se pudo actualizar el producto.' : 'No se pudo crear el producto.',
      () => {
        this.resetProductoForm();
        this.loadProductos();
      }
    );
  }

  editProducto(item: Producto): void {
    this.editingProductoIdState.set(item.id);
    this.productoForm = {
      productoNombre: item.productoNombre,
      descripcion: item.descripcion || '',
      productoImg: item.productoImg || '',
      cantidad: item.cantidad,
      precio: item.precio,
      precioVenta: item.precioVenta,
      fechaAdquisicion: item.fechaAdquisicion ? item.fechaAdquisicion.substring(0, 10) : '',
      proveedorId: item.proveedor?.id || 0,
      categoriaProductoId: item.categoriaProducto?.id || 0
    };
    this.setTab('productos');
  }

  async deleteProducto(id: number): Promise<void> {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    await this.runMutation(
      () => this.ventasService.deleteProducto(id),
      'Producto eliminado correctamente.',
      'No se pudo eliminar el producto.',
      () => {
        if (this.editingProductoId === id) this.resetProductoForm();
        this.loadProductos();
      }
    );
  }

  resetProductoForm(): void {
    this.editingProductoIdState.set(null);
    this.productoForm = {
      productoNombre: '',
      descripcion: '',
      productoImg: '',
      cantidad: 0,
      precio: 0,
      precioVenta: 0,
      fechaAdquisicion: '',
      proveedorId: 0,
      categoriaProductoId: 0
    };
  }

  async submitVenta(): Promise<void> {
    if (!this.ventaForm.beneficiarioNombre.trim()) {
      this.showError('El nombre del beneficiario es obligatorio.');
      return;
    }

    if (!this.ventaForm.productoId || !this.ventaForm.tipoPagoId || !this.ventaForm.estadoVentaId) {
      this.showError('Debes seleccionar producto, tipo de pago y estado de venta.');
      return;
    }

    if (!this.ventaForm.fechaVenta) {
      this.showError('La fecha de venta es obligatoria.');
      return;
    }

    const payload: VentaPayload = {
      ...this.ventaForm,
      fechaPago: this.ventaForm.fechaPago || null,
      fechaLiquidacion: this.ventaForm.fechaLiquidacion || null
    };

    await this.runMutation(
      () =>
        this.editingVentaId
          ? this.ventasService.updateVenta(this.editingVentaId, payload)
          : this.ventasService.createVenta(payload),
      this.editingVentaId ? 'Venta actualizada correctamente.' : 'Venta creada correctamente.',
      this.editingVentaId ? 'No se pudo actualizar la venta.' : 'No se pudo crear la venta.',
      () => {
        this.resetVentaForm();
        this.loadVentas();
      }
    );
  }

  editVenta(item: Venta): void {
    this.editingVentaIdState.set(item.id);
    this.ventaForm = {
      beneficiarioNombre: item.beneficiarioNombre,
      beneficiarioTelefono: item.beneficiarioTelefono || '',
      beneficiarioDireccion: item.beneficiarioDireccion || '',
      productoId: item.producto?.id || 0,
      cantidadVenta: item.cantidadVenta,
      conDomicilio: item.conDomicilio,
      estadoVentaId: item.estadoVenta?.id || 0,
      fechaVenta: item.fechaVenta ? item.fechaVenta.substring(0, 10) : '',
      fechaPago: item.fechaPago ? item.fechaPago.substring(0, 10) : '',
      fechaLiquidacion: item.fechaLiquidacion ? item.fechaLiquidacion.substring(0, 10) : '',
      tipoPagoId: item.tipoPago?.id || 0
    };
    this.setTab('ventas');
  }

  async deleteVenta(id: number): Promise<void> {
    if (!confirm('¿Seguro que deseas eliminar esta venta?')) return;

    await this.runMutation(
      () => this.ventasService.deleteVenta(id),
      'Venta eliminada correctamente.',
      'No se pudo eliminar la venta.',
      () => {
        if (this.editingVentaId === id) this.resetVentaForm();
        this.loadVentas();
      }
    );
  }

  resetVentaForm(): void {
    this.editingVentaIdState.set(null);
    this.ventaForm = {
      beneficiarioNombre: '',
      beneficiarioTelefono: '',
      beneficiarioDireccion: '',
      productoId: 0,
      cantidadVenta: 0,
      conDomicilio: false,
      estadoVentaId: 0,
      fechaVenta: '',
      fechaPago: '',
      fechaLiquidacion: '',
      tipoPagoId: 0
    };
  }

  private async runMutation<T>(
    operation: () => Observable<T>,
    successMessage: string,
    fallbackMessage: string,
    onSuccess: () => void
  ): Promise<void> {
    this.loadingState.set(true);
    try {
      await firstValueFrom(operation());
      this.showSuccess(successMessage);
      onSuccess();
    } catch (error) {
      this.handleError(error, fallbackMessage);
    } finally {
      this.loadingState.set(false);
    }
  }
}