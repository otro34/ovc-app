import { contractService } from './contractService';

// Type for Node.js timeout - using ReturnType from setTimeout
type NodeTimeout = ReturnType<typeof setTimeout>;

export class AutomatedTasksService {
  private intervalId: NodeTimeout | null = null;
  private readonly CHECK_INTERVAL = 60 * 60 * 1000; // 1 hora en millisegundos

  /**
   * Inicia la ejecución automática de tareas de mantenimiento
   */
  start(): void {
    if (this.intervalId) {
      this.stop(); // Detener si ya está ejecutándose
    }

    console.log('🤖 Iniciando tareas automáticas del sistema...');

    // Ejecutar inmediatamente al iniciar
    this.runMaintenanceTasks();

    // Programar ejecución periódica
    this.intervalId = setInterval(() => {
      this.runMaintenanceTasks();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Detiene la ejecución automática de tareas
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Tareas automáticas detenidas');
    }
  }

  /**
   * Ejecuta todas las tareas de mantenimiento
   */
  private async runMaintenanceTasks(): Promise<void> {
    try {
      console.log('🔄 Ejecutando tareas de mantenimiento...');

      // Actualizar estados de contratos
      await this.updateContractStatuses();

      // Aquí se pueden agregar más tareas automáticas en el futuro
      // - Limpiar datos antiguos
      // - Generar reportes automáticos
      // - Enviar notificaciones

      console.log('✅ Tareas de mantenimiento completadas');
    } catch (error) {
      console.error('❌ Error en tareas de mantenimiento:', error);
    }
  }

  /**
   * Actualiza los estados de todos los contratos
   */
  private async updateContractStatuses(): Promise<void> {
    try {
      console.log('📋 Actualizando estados de contratos...');
      await contractService.updateAllContractStatuses();
      console.log('✅ Estados de contratos actualizados');
    } catch (error) {
      console.error('❌ Error actualizando estados de contratos:', error);
    }
  }

  /**
   * Ejecuta las tareas de mantenimiento inmediatamente (para pruebas)
   */
  async runNow(): Promise<void> {
    console.log('🚀 Ejecutando tareas de mantenimiento inmediatamente...');
    await this.runMaintenanceTasks();
  }

  /**
   * Obtiene el estado del servicio
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }

  /**
   * Obtiene información sobre el próximo ciclo
   */
  getNextRunInfo(): string {
    if (!this.isRunning()) {
      return 'Servicio detenido';
    }

    const nextRun = new Date(Date.now() + this.CHECK_INTERVAL);
    return `Próxima ejecución: ${nextRun.toLocaleString('es-CO')}`;
  }
}

// Crear instancia única
export const automatedTasks = new AutomatedTasksService();

// Iniciar automáticamente cuando se importa el módulo
if (typeof window !== 'undefined') {
  // Solo en el navegador
  automatedTasks.start();

  // Detener las tareas cuando se cierre la página
  window.addEventListener('beforeunload', () => {
    automatedTasks.stop();
  });
}