// User Roles
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CLIENT: 'client'
};

// Car Status
const CAR_STATUS = {
  AVAILABLE: 'available',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
  UNAVAILABLE: 'unavailable'
};

// Fuel Types
const FUEL_TYPES = {
  PETROL: 'petrol',
  DIESEL: 'diesel',
  ELECTRIC: 'electric',
  HYBRID: 'hybrid'
};

// Transmission Types
const TRANSMISSION_TYPES = {
  MANUAL: 'manual',
  AUTOMATIC: 'automatic'
};

// Reservation Status
const RESERVATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Maintenance Types
const MAINTENANCE_TYPES = {
  OIL_CHANGE: 'oil_change',
  TIRE_CHANGE: 'tire_change',
  BRAKE_SERVICE: 'brake_service',
  GENERAL_SERVICE: 'general_service',
  REPAIR: 'repair',
  INSPECTION: 'inspection',
  OTHER: 'other'
};

// Notification Types
const NOTIFICATION_TYPES = {
  RESERVATION_NEW: 'reservation_new',
  RESERVATION_APPROVED: 'reservation_approved',
  RESERVATION_REJECTED: 'reservation_rejected',
  RESERVATION_CANCELLED: 'reservation_cancelled',
  RESERVATION_COMPLETED: 'reservation_completed',
  CONTRACT_READY: 'contract_ready',
  MAINTENANCE_DUE: 'maintenance_due',
  MESSAGE_NEW: 'message_new',
  SCORE_ADDED: 'score_added',
  ACCOUNT_BLOCKED: 'account_blocked',
  ACCOUNT_UNBLOCKED: 'account_unblocked'
};

// Manager Permissions
const MANAGER_PERMISSIONS = {
  MANAGE_CARS: 'manage_cars',
  MANAGE_RESERVATIONS: 'manage_reservations',
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_MAINTENANCE: 'manage_maintenance',
  VIEW_REPORTS: 'view_reports',
  SEND_MESSAGES: 'send_messages'
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

module.exports = {
  ROLES,
  CAR_STATUS,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  RESERVATION_STATUS,
  MAINTENANCE_TYPES,
  NOTIFICATION_TYPES,
  MANAGER_PERMISSIONS,
  PAGINATION
};
