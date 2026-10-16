import { apiClient } from './apiClient.js';

export const reportService = {
  async getReportData(reportType, filters = {}) {
    // Generates enterprise metrics based on report type
    const metricsMap = {
      demands: {
        total: 1842,
        approved: 1420,
        pending: 310,
        rejected: 112,
        totalValue: '₹ 184.20 Crore',
        rows: [
          { period: '2024-Q3', region: 'North (Delhi/Punjab)', demands: 680, approved: 540, value: '₹ 72.4 Cr' },
          { period: '2024-Q3', region: 'West (Pune/Mumbai)', demands: 490, approved: 390, value: '₹ 51.2 Cr' },
          { period: '2024-Q3', region: 'Central (Lucknow)', demands: 360, approved: 280, value: '₹ 36.8 Cr' },
          { period: '2024-Q3', region: 'South (Bangalore/Chennai)', demands: 312, approved: 210, value: '₹ 23.8 Cr' }
        ]
      },
      orders: {
        total: 1390,
        dispatched: 1120,
        delivered: 980,
        inTransit: 140,
        rows: [
          { brand: 'Tata Motors', orders: 512, delivered: 460, pending: 52, avgDaysToDeliver: 14 },
          { brand: 'Maruti Suzuki', orders: 480, delivered: 420, pending: 60, avgDaysToDeliver: 11 },
          { brand: 'Mahindra & Mahindra', orders: 230, delivered: 190, pending: 40, avgDaysToDeliver: 18 },
          { brand: 'Royal Enfield', orders: 168, delivered: 150, pending: 18, avgDaysToDeliver: 7 }
        ]
      },
      payments: {
        totalCollected: '₹ 162.80 Crore',
        sbiCyberTreasury: '₹ 114.20 Crore',
        bharatkosh: '₹ 48.60 Crore',
        unreconciled: '₹ 0.42 Crore',
        rows: [
          { gateway: 'SBI Cyber Treasury (e-Pay)', transactions: 1140, amount: '₹ 114.20 Cr', status: 'Reconciled 100%' },
          { gateway: 'Bharatkosh Non-Tax Portal', transactions: 480, amount: '₹ 48.60 Cr', status: 'Reconciled 99.8%' },
          { gateway: 'Manual Challan (Special Approval)', transactions: 8, amount: '₹ 0.42 Cr', status: 'Pending Reconciliation' }
        ]
      },
      helpdesk: {
        totalTickets: 1240,
        resolvedWithinSla: 1162,
        breachedSla: 78,
        slaComplianceRate: '93.7%',
        rows: [
          { category: 'Supply Order Generation', tickets: 440, avgResolutionHours: 3.4, breached: 12 },
          { category: 'Dealer Handling Fees Inquiry', tickets: 310, avgResolutionHours: 6.8, breached: 34 },
          { category: 'Eligibility / Entitlement Checks', tickets: 280, avgResolutionHours: 1.8, breached: 4 },
          { category: 'Payment Verification', tickets: 210, avgResolutionHours: 2.2, breached: 8 }
        ]
      }
    };

    const res = await apiClient.get(`/reports/${reportType}`, metricsMap[reportType] || metricsMap.demands);
    return res.data;
  },

  exportToCsv(filename, headers, rows) {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => Object.values(e).map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
