// src/utils/performanceMonitor.js

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
    this.maxMetrics = 1000; // Limit stored metrics to prevent memory leaks
  }

  recordMetric(type, data) {
    if (!this.isEnabled) return;

    const timestamp = Date.now();
    const metric = {
      type,
      data,
      timestamp
    };

    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }

    const typeMetrics = this.metrics.get(type);
    typeMetrics.push(metric);

    // Limit metrics per type
    if (typeMetrics.length > this.maxMetrics) {
      typeMetrics.shift(); // Remove oldest metric
    }

    // Log important metrics in development
    if (this.shouldLog(type, data)) {
      console.log(`📊 [Performance] ${type}:`, data);
    }
  }

  shouldLog(type, data) {
    // Log slow operations or errors
    if (type === 'redux_error' || type === 'slow_dispatch') {
      return true;
    }
    
    if (type === 'redux_action' && data.duration > 10) {
      return true;
    }

    return false;
  }

  getMetrics(type) {
    return this.metrics.get(type) || [];
  }

  getAllMetrics() {
    const result = {};
    for (const [type, metrics] of this.metrics) {
      result[type] = metrics;
    }
    return result;
  }

  getAverageMetric(type, property) {
    const metrics = this.getMetrics(type);
    if (metrics.length === 0) return 0;

    const values = metrics
      .map(m => m.data[property])
      .filter(v => typeof v === 'number');
    
    if (values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  clearMetrics(type) {
    if (type) {
      this.metrics.delete(type);
    } else {
      this.metrics.clear();
    }
  }

  getStats() {
    const stats = {};
    
    for (const [type, metrics] of this.metrics) {
      stats[type] = {
        count: metrics.length,
        latest: metrics[metrics.length - 1]?.timestamp,
        oldest: metrics[0]?.timestamp
      };
    }

    return stats;
  }
}

// Mock services for testing
class MockRobotService {
  constructor() {
    this.connected = false;
    this.jointAngles = [0, 0, 0];
  }

  async connect() {
    this.connected = true;
    return { success: true };
  }

  async disconnect() {
    this.connected = false;
    return { success: true };
  }

  async getJointAngles() {
    return this.jointAngles;
  }

  async setJointAngles(angles) {
    this.jointAngles = [...angles];
    return { success: true };
  }

  async emergencyStop() {
    return { success: true };
  }

  async enableTorque(actuatorId) {
    return { success: true };
  }

  async disableTorque(actuatorId) {
    return { success: true };
  }
}

class MockWebSocketService {
  constructor() {
    this.connected = false;
    this.listeners = new Map();
  }

  connect(token) {
    this.connected = true;
    setTimeout(() => {
      this.emit('connection_status', { connected: true });
    }, 100);
  }

  disconnect() {
    this.connected = false;
    this.emit('connection_status', { connected: false });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  sendRobotCommand(command, parameters) {
    // Mock implementation
    console.log('Mock robot command:', command, parameters);
  }

  subscribeToRobotUpdates(callback) {
    this.on('robot_status', callback);
  }

  subscribeToChallengeUpdates(callback) {
    this.on('challenge_update', callback);
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export everything for easy testing and usage
export {
  PerformanceMonitor,
  MockRobotService,
  MockWebSocketService
};

export default performanceMonitor;