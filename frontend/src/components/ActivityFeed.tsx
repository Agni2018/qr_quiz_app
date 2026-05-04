import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Pagination from '@/components/Pagination';

interface Activity {
    _id: string;
    actionTitle: string;
    actionDescription: string;
    createdAt: string;
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/activities?page=${currentPage}&limit=${itemsPerPage}`);
                setActivities(res.data.activities);
                setTotalItems(res.data.total || 0);
            } catch (error) {
                console.error('Failed to fetch activities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [currentPage]);

    if (loading) {
        return (
            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Recent Activity</h3>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%' }}></div>
                </div>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2rem', opacity: 0.5 }}>📭</span>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#94a3b8' }}>No recent activity yet</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activities.map((activity) => (
                    <div key={activity._id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ 
                            width: '32px', height: '32px', borderRadius: '50%', 
                            backgroundColor: '#eff6ff', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                        }}>
                            <span style={{ color: '#3b82f6', fontSize: '14px' }}>⚡</span>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                                {activity.actionTitle}
                            </p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                {activity.actionDescription}
                            </p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>
                                {new Date(activity.createdAt).toLocaleString(undefined, { 
                                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                                })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            
            {totalItems > itemsPerPage && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
}
