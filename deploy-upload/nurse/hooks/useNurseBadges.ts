/**
 * Nurse Badge Counters Hook
 * Real-time badge counts for sidebar navigation
 */

import { useState, useEffect } from 'react';
import { getNurseDashboardStats } from '@/lib/actions/nurse.actions';

export interface NurseBadges {
  criticalAlerts: number;
  patientsNeedingData: number;
  highRiskPatients: number;
  totalAssigned: number;
}

export function useNurseBadges(nurseId: string | null) {
  const [badges, setBadges] = useState<NurseBadges>({
    criticalAlerts: 0,
    patientsNeedingData: 0,
    highRiskPatients: 0,
    totalAssigned: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nurseId) {
      setLoading(false);
      return;
    }

    async function fetchBadges() {
      try {
        const result = await getNurseDashboardStats(nurseId);
        
        if (result.success && result.stats) {
          setBadges({
            criticalAlerts: result.stats.activeAlerts || 0,
            patientsNeedingData: result.stats.patientsNeedingDataEntry || 0,
            highRiskPatients: 0, // Will be calculated from risk scores
            totalAssigned: result.stats.totalAssignedPatients || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching nurse badges:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchBadges, 30000);
    
    return () => clearInterval(interval);
  }, [nurseId]);

  return { badges, loading };
}
