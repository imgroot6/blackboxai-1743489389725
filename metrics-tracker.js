// Real-time usage tracker
class MetricsTracker {
    constructor() {
        this.metrics = {
            onlineUsers: new Set(),
            activeCalls: new Set(),
            connections: 0,
            revenue: 0,
            callDurations: [],
            peakHours: {},
            userCountries: new Set()
        };
        this.history = [];
    }

    userConnected(userId, country) {
        this.metrics.onlineUsers.add(userId);
        this.metrics.userCountries.add(country);
        this.metrics.connections++;
        this.recordPeakHour();
    }

    userDisconnected(userId) {
        this.metrics.onlineUsers.delete(userId);
    }

    callStarted(callId) {
        this.metrics.activeCalls.add(callId);
        this.recordPeakHour();
    }

    callEnded(callId, duration) {
        this.metrics.activeCalls.delete(callId);
        this.metrics.callDurations.push(duration);
        this.metrics.revenue += this.calculateRevenue(duration);
    }

    calculateRevenue(duration) {
        // $0.10 per minute
        return duration * 0.10;
    }

    recordPeakHour() {
        const hour = new Date().getHours();
        this.metrics.peakHours[hour] = (this.metrics.peakHours[hour] || 0) + 1;
    }

    getCurrentMetrics() {
        const now = new Date();
        const avgDuration = this.metrics.callDurations.length > 0 
            ? (this.metrics.callDurations.reduce((a,b) => a + b, 0) / this.metrics.callDurations.length).toFixed(1)
            : 0;

        // Determine peak hours
        let peakHours = Object.entries(this.metrics.peakHours)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 3)
            .map(([hour]) => `${hour}:00-${parseInt(hour)+1}:00`);

        return {
            timestamp: now.toISOString(),
            onlineUsers: this.metrics.onlineUsers.size,
            activeCalls: this.metrics.activeCalls.size,
            totalConnections: this.metrics.connections,
            revenue: parseFloat(this.metrics.revenue.toFixed(2)),
            avgDuration,
            peakHours: peakHours.length > 0 ? peakHours.join(', ') : 'N/A',
            userCountries: this.metrics.userCountries.size,
            uptime: 100, // Will be calculated by uptime monitor
            latency: this.getAverageLatency(),
            storage: this.getStorageUsage()
        };
    }

    getAverageLatency() {
        // Implementation for real latency monitoring
        return Math.floor(Math.random() * 20) + 20; // Mock for now
    }

    getStorageUsage() {
        // Implementation for storage monitoring
        return Math.floor(Math.random() * 20) + 70; // Mock for now
    }
}

module.exports = new MetricsTracker();