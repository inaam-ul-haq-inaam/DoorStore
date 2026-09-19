import { useEffect } from 'react';
import { syncDeliveryConfigFromStaffDoc } from '../services/deliveryConfig';

/**
 * AdminApp mount hone pe ek dafa staff ke profile se delivery config ko
 * `settings/delivery` mein mirror kar deta hai, taake shop location / fees
 * pehle se save hone ke bawajood customer app ko mil jayein.
 */
export const useDeliveryConfigSync = () => {
  useEffect(() => {
    syncDeliveryConfigFromStaffDoc();
  }, []);
};
