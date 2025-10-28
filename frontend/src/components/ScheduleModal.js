import React from 'react';

const ScheduleModal = ({ 
  show, 
  onClose, 
  selectedRequest, 
  scheduleData, 
  onChange, 
  onSubmit, 
  drivers, 
  vehicles,
  loading 
}) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Schedule Trip</h3>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="modal-body">
          {selectedRequest && (
            <div className="request-info">
              <h4>Request Details</h4>
              <p><strong>Customer:</strong> {selectedRequest.customer_name}</p>
              <p><strong>Phone:</strong> {selectedRequest.phone}</p>
              <p><strong>Pickup:</strong> {selectedRequest.pickup_location}</p>
              <p><strong>Dropoff:</strong> {selectedRequest.dropoff_location}</p>
              <p><strong>Passengers:</strong> {selectedRequest.passengers}</p>
              <p>
                <strong>Requested Time:</strong>{' '}
                {new Date(selectedRequest.pickup_time).toLocaleString()}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="driver_id">
                <i className="bi bi-person-fill"></i> Select Driver
              </label>
              <select
                id="driver_id"
                name="driver_id"
                value={scheduleData.driver_id}
                onChange={onChange}
                required
                className="form-control"
              >
                <option value="">Choose a driver...</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - License: {driver.license_number}
                    {!driver.available && ' (Unavailable)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="vehicle_id">
                <i className="bi bi-bus-front"></i> Select Vehicle
              </label>
              <select
                id="vehicle_id"
                name="vehicle_id"
                value={scheduleData.vehicle_id}
                onChange={onChange}
                required
                className="form-control"
              >
                <option value="">Choose a vehicle...</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.year}) - 
                    Plate: {vehicle.license_plate} - 
                    Capacity: {vehicle.capacity}
                    {!vehicle.available && ' (Unavailable)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="scheduled_time">
                <i className="bi bi-calendar-event"></i> Scheduled Time
              </label>
              <input
                type="datetime-local"
                id="scheduled_time"
                name="scheduled_time"
                value={scheduleData.scheduled_time}
                onChange={onChange}
                required
                className="form-control"
              />
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <i className="bi bi-calendar-check me-2"></i>
                    Schedule Trip
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
