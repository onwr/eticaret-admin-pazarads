
import { CallPoolItem, CallPoolStatus, CallSession, CallOutcome, Order, OrderStatus, ShippingStatus } from '../types';
import { getOrders } from './api';

// Mock Data Store
let callPool: CallPoolItem[] = [];
let activeSession: CallSession | null = null;

// Helper to calculate next retry
const calculateNextRetry = (currentRetries: number): string => {
    const now = new Date();
    if (currentRetries === 0) return new Date(now.getTime() + 5 * 60000).toISOString(); // 5 mins
    if (currentRetries === 1) return new Date(now.getTime() + 10 * 60000).toISOString(); // 10 mins
    if (currentRetries === 2) return new Date(now.getTime() + 30 * 60000).toISOString(); // 30 mins
    return ''; // No more retries
};

export const getPoolCounts = async () => {
    const orders = await getOrders();

    // Group by Order Status
    const orderCounts: Record<string, number> = {};
    Object.values(OrderStatus).forEach(s => {
        if (s !== OrderStatus.ONAYLANDI && s !== OrderStatus.KARGODA) {
            orderCounts[s] = orders.filter(o => o.status === s).length;
        }
    });

    // Group by Cargo Status (Mocking cargo status on orders for now)
    const cargoCounts: Record<string, number> = {};
    // Mocking some cargo data distribution
    cargoCounts[ShippingStatus.PREPARING] = 5;
    cargoCounts[ShippingStatus.SHIPPED] = 12;
    cargoCounts[ShippingStatus.RETURNED] = 3;
    cargoCounts[ShippingStatus.CANCELLED] = 1;

    return { orderCounts, cargoCounts };
};

export const populatePool = async (type: 'ORDER' | 'CARGO', status: string) => {
    const orders = await getOrders();
    let targetOrders: Order[] = [];

    if (type === 'ORDER') {
        targetOrders = orders.filter(o => o.status === status);
    } else {
        // Mock cargo filtering
        targetOrders = orders.filter(o => Math.random() > 0.8); // Random subset for demo
    }

    // Reset Pool with new items
    callPool = targetOrders.map(o => ({
        id: `pool-${o.id}-${Date.now()}`,
        orderId: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer?.name || 'Bilinmiyor',
        customerPhone: o.customer?.phone || '',
        status: CallPoolStatus.WAITING,
        priority: 1,
        addedAt: new Date().toISOString(),
        order: o,
        retryCount: 0
    }));

    return callPool;
};

export const getCallPool = async (): Promise<CallPoolItem[]> => {
    return [...callPool];
};

export const startAutoDialer = async (): Promise<CallPoolItem | null> => {
    // Find next waiting item that is ready (check retry time)
    const now = new Date().toISOString();
    const nextItem = callPool.find(i =>
        i.status === CallPoolStatus.WAITING &&
        (!i.nextRetryAt || i.nextRetryAt <= now)
    );

    if (!nextItem) return null;

    // Update status to DIALING
    nextItem.status = CallPoolStatus.DIALING;

    // Create Session
    activeSession = {
        id: `session-${Date.now()}`,
        poolItemId: nextItem.id,
        agentId: 'current-user',
        startTime: new Date().toISOString(),
        durationSeconds: 0
    };

    return nextItem;
};

// Simulate connection (returns true if answered, false if busy/failed)
export const simulateConnection = async (poolItemId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Ringing...

    const isAnswered = Math.random() > 0.4; // 60% answer rate

    const item = callPool.find(i => i.id === poolItemId);
    if (item) {
        if (isAnswered) {
            item.status = CallPoolStatus.CONNECTED;
        } else {
            // Handle Retry Logic Immediately if not answered
            const retries = item.retryCount || 0;
            if (retries < 3) {
                item.retryCount = retries + 1;
                item.nextRetryAt = calculateNextRetry(retries);
                item.status = CallPoolStatus.WAITING; // Back to pool
                item.lastCallOutcome = CallOutcome.UNREACHABLE;
            } else {
                item.status = CallPoolStatus.FAILED; // Exhausted retries
                item.lastCallOutcome = CallOutcome.UNREACHABLE;
                // Ideally update Order Status to ULASILAMADI here
            }
        }
    }

    return isAnswered;
};

export const completeCall = async (poolItemId: string, outcome: CallOutcome, notes?: string) => {
    const item = callPool.find(i => i.id === poolItemId);
    if (item) {
        item.status = CallPoolStatus.COMPLETED;
    }

    if (activeSession) {
        activeSession.endTime = new Date().toISOString();
        activeSession.outcome = outcome;
        activeSession.notes = notes;
        activeSession.durationSeconds = (new Date().getTime() - new Date(activeSession.startTime).getTime()) / 1000;
    }

    console.log("Call Completed:", activeSession);
    activeSession = null;
};

export const getAgentPerformance = async () => {
    // Mock stats
    return {
        totalCalls: 45,
        avgDuration: "2dk 15sn",
        successRate: 68,
        ordersApproved: 12
    };
};
