/// MediFollow - Access Control Smart Contract
/// Manages doctor-patient access permissions on Aptos blockchain
module medifollow_addr::access_control {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_ALREADY_GRANTED: u64 = 2;
    const E_PERMISSION_NOT_FOUND: u64 = 3;

    /// Access permission structure
    struct AccessPermission has store, drop, copy {
        doctor_address: address,
        patient_id: vector<u8>,
        granted_at: u64,
        expires_at: u64,
        is_active: bool,
    }

    /// Global access registry
    struct AccessRegistry has key {
        permissions: vector<AccessPermission>,
    }

    /// Access log entry
    struct AccessLog has store, drop, copy {
        doctor_address: address,
        patient_id: vector<u8>,
        accessed_at: u64,
    }

    /// Access log storage
    struct AccessLogs has key {
        logs: vector<AccessLog>,
    }

    /// Initialize the access control system
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        if (!exists<AccessRegistry>(account_addr)) {
            move_to(account, AccessRegistry {
                permissions: vector::empty<AccessPermission>(),
            });
        };

        if (!exists<AccessLogs>(account_addr)) {
            move_to(account, AccessLogs {
                logs: vector::empty<AccessLog>(),
            });
        };
    }

    /// Grant access to a doctor for a specific patient
    public entry fun grant_access(
        admin: &signer,
        doctor_address: address,
        patient_id: vector<u8>,
        duration_seconds: u64,
    ) acquires AccessRegistry {
        let admin_addr = signer::address_of(admin);
        
        // Check if registry exists, initialize if not
        if (!exists<AccessRegistry>(admin_addr)) {
            initialize(admin);
        };

        let registry = borrow_global_mut<AccessRegistry>(admin_addr);
        let now = timestamp::now_seconds();
        let expires_at = now + duration_seconds;

        // Check if permission already exists
        let len = vector::length(&registry.permissions);
        let i = 0;
        while (i < len) {
            let perm = vector::borrow(&registry.permissions, i);
            if (perm.doctor_address == doctor_address && perm.patient_id == patient_id && perm.is_active) {
                abort E_ALREADY_GRANTED
            };
            i = i + 1;
        };

        // Add new permission
        vector::push_back(&mut registry.permissions, AccessPermission {
            doctor_address,
            patient_id,
            granted_at: now,
            expires_at,
            is_active: true,
        });
    }

    /// Revoke access from a doctor for a specific patient
    public entry fun revoke_access(
        admin: &signer,
        doctor_address: address,
        patient_id: vector<u8>,
    ) acquires AccessRegistry {
        let admin_addr = signer::address_of(admin);
        let registry = borrow_global_mut<AccessRegistry>(admin_addr);

        let len = vector::length(&registry.permissions);
        let i = 0;
        let found = false;

        while (i < len) {
            let perm = vector::borrow_mut(&mut registry.permissions, i);
            if (perm.doctor_address == doctor_address && perm.patient_id == patient_id && perm.is_active) {
                perm.is_active = false;
                found = true;
                break
            };
            i = i + 1;
        };

        assert!(found, E_PERMISSION_NOT_FOUND);
    }

    /// Check if a doctor has access to a patient's data (view function)
    #[view]
    public fun has_access(
        registry_addr: address,
        doctor_address: address,
        patient_id: vector<u8>,
    ): bool acquires AccessRegistry {
        if (!exists<AccessRegistry>(registry_addr)) {
            return false
        };

        let registry = borrow_global<AccessRegistry>(registry_addr);
        let now = timestamp::now_seconds();
        let len = vector::length(&registry.permissions);
        let i = 0;

        while (i < len) {
            let perm = vector::borrow(&registry.permissions, i);
            if (perm.doctor_address == doctor_address && 
                perm.patient_id == patient_id && 
                perm.is_active && 
                perm.expires_at > now) {
                return true
            };
            i = i + 1;
        };

        false
    }

    /// Log data access (called when doctor accesses patient data)
    public entry fun log_access(
        admin: &signer,
        doctor_address: address,
        patient_id: vector<u8>,
    ) acquires AccessRegistry, AccessLogs {
        let admin_addr = signer::address_of(admin);
        let now = timestamp::now_seconds();

        // Verify doctor has access
        assert!(has_access(admin_addr, doctor_address, patient_id), E_NOT_AUTHORIZED);

        // Log the access
        if (!exists<AccessLogs>(admin_addr)) {
            initialize(admin);
        };

        let logs = borrow_global_mut<AccessLogs>(admin_addr);
        vector::push_back(&mut logs.logs, AccessLog {
            doctor_address,
            patient_id,
            accessed_at: now,
        });
    }

    /// Get permission details for a specific doctor-patient pair (view function)
    #[view]
    public fun get_permission(
        registry_addr: address,
        doctor_address: address,
        patient_id: vector<u8>,
    ): (bool, u64, u64) acquires AccessRegistry {
        if (!exists<AccessRegistry>(registry_addr)) {
            return (false, 0, 0)
        };

        let registry = borrow_global<AccessRegistry>(registry_addr);
        let len = vector::length(&registry.permissions);
        let i = 0;

        while (i < len) {
            let perm = vector::borrow(&registry.permissions, i);
            if (perm.doctor_address == doctor_address && perm.patient_id == patient_id && perm.is_active) {
                return (true, perm.granted_at, perm.expires_at)
            };
            i = i + 1;
        };

        (false, 0, 0)
    }
}
