// Build a React form component for trip request: Fields for name, phone, pickup/dropoff locations, 
// pickup time (datetime-local), passengers (number), notes (textarea). Use useState for form data. 
// Client validation (required fields). On submit, axios POST to /requests, show success message or errors. 
// Add loading state with spinner.

import React, { useState } from 'react';
import axios from 'axios';
import './RequestForm.css';

const RequestForm = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    pickup_location: '',
    dropoff_location: '',
    pickup_time: '',
    passengers: 1,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user types
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors = [];

    if (!formData.customer_name.trim()) {
      newErrors.push('Name is required');
    } else if (formData.customer_name.length < 2) {
      newErrors.push('Name must be at least 2 characters');
    }

    if (!formData.phone.trim()) {
      newErrors.push('Phone number is required');
    }

    if (!formData.pickup_time) {
      newErrors.push('Pickup time is required');
    } else {
      const pickupDate = new Date(formData.pickup_time);
      const now = new Date();
      if (pickupDate < now) {
        newErrors.push('Pickup time must be in the future');
      }
    }

    if (formData.passengers < 1) {
      newErrors.push('At least 1 passenger is required');
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);
    setSuccess(false);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await axios.post(`${API_URL}/requests`, formData);

      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          customer_name: '',
          phone: '',
          pickup_location: '',
          dropoff_location: '',
          pickup_time: '',
          passengers: 1,
          notes: '',
        });

        // Hide success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      
      if (error.response?.data?.errors) {
        // Server validation errors
        const serverErrors = error.response.data.errors.map(err => err.msg || err.message);
        setErrors(serverErrors);
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(['Failed to submit request. Please try again.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 request-form-container">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          {/* Header Section */}
          <div className="text-center mb-4">
            <div className="icon-circle">
              <i className="bi bi-bus-front fs-1 text-primary"></i>
            </div>
            <h1 className="display-5 fw-bold mb-2">Request a Trip</h1>
            <p className="text-muted fs-5">Fill out the form below and we'll get back to you shortly</p>
          </div>

          <div className="card shadow-lg border-0 request-form-card">
            <div className="card-body p-4 p-md-5">
              {success && (
                <div className="alert alert-success alert-dismissible fade show border-0 shadow-sm" role="alert">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-check-circle-fill fs-4 me-3 text-success"></i>
                    <div className="flex-grow-1">
                      <h5 className="alert-heading mb-1">Success!</h5>
                      <p className="mb-0">Your trip request has been submitted successfully. We'll contact you soon to confirm the details.</p>
                    </div>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setSuccess(false)}
                      aria-label="Close"
                    ></button>
                  </div>
                </div>
              )}

              {errors.length > 0 && (
                <div className="alert alert-danger alert-dismissible fade show border-0 shadow-sm" role="alert">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-exclamation-triangle-fill fs-4 me-3 text-danger"></i>
                    <div className="flex-grow-1">
                      <h5 className="alert-heading mb-2">Please fix the following issues:</h5>
                      <ul className="mb-0 ps-3">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setErrors([])}
                      aria-label="Close"
                    ></button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                <div className="mb-4">
                  <h5 className="fw-bold text-primary mb-3 section-header">
                    <i className="bi bi-person-circle me-2"></i>
                    Personal Information
                  </h5>
                  <div className="row g-3">
                    {/* Name */}
                    <div className="col-md-6">
                      <label htmlFor="customer_name" className="form-label fw-semibold">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          id="customer_name"
                          name="customer_name"
                          value={formData.customer_name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="col-md-6">
                      <label htmlFor="phone" className="form-label fw-semibold">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-telephone"></i>
                        </span>
                        <input
                          type="tel"
                          className="form-control border-start-0 ps-0"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="e.g., 555-1234"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Trip Details Section */}
                <div className="mb-4">
                  <h5 className="fw-bold text-primary mb-3 section-header">
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    Trip Details
                  </h5>
                  <div className="row g-3">
                    {/* Pickup Location */}
                    <div className="col-md-6">
                      <label htmlFor="pickup_location" className="form-label fw-semibold">
                        Pickup Location
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-pin-map"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          id="pickup_location"
                          name="pickup_location"
                          value={formData.pickup_location}
                          onChange={handleChange}
                          placeholder="e.g., Downtown Station"
                        />
                      </div>
                    </div>

                    {/* Dropoff Location */}
                    <div className="col-md-6">
                      <label htmlFor="dropoff_location" className="form-label fw-semibold">
                        Dropoff Location
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-pin-map-fill"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          id="dropoff_location"
                          name="dropoff_location"
                          value={formData.dropoff_location}
                          onChange={handleChange}
                          placeholder="e.g., Airport Terminal 1"
                        />
                      </div>
                    </div>

                    {/* Pickup Time */}
                    <div className="col-md-6">
                      <label htmlFor="pickup_time" className="form-label fw-semibold">
                        Pickup Date & Time <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-calendar-event"></i>
                        </span>
                        <input
                          type="datetime-local"
                          className="form-control border-start-0 ps-0"
                          id="pickup_time"
                          name="pickup_time"
                          value={formData.pickup_time}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Passengers */}
                    <div className="col-md-6">
                      <label htmlFor="passengers" className="form-label fw-semibold">
                        Number of Passengers
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-people"></i>
                        </span>
                        <input
                          type="number"
                          className="form-control border-start-0 ps-0"
                          id="passengers"
                          name="passengers"
                          value={formData.passengers}
                          onChange={handleChange}
                          min="1"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Additional Information Section */}
                <div className="mb-4">
                  <h5 className="fw-bold text-primary mb-3 section-header">
                    <i className="bi bi-chat-left-text me-2"></i>
                    Additional Information
                  </h5>
                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="form-label fw-semibold">
                      Additional Notes
                    </label>
                    <textarea
                      className="form-control"
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Any special requirements or notes..."
                      style={{ resize: 'vertical' }}
                    ></textarea>
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      Optional: Include wheelchair access, luggage details, or any special requests
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg py-3 fw-semibold btn-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting Your Request...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill me-2"></i>
                        Submit Request
                      </>
                    )}
                  </button>
                </div>

                {/* Required Fields Note */}
                <div className="text-center mt-3">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Fields marked with <span className="text-danger fw-bold">*</span> are required
                  </small>
                </div>
              </form>
            </div>
          </div>

          {/* Help Text */}
          <div className="card border-0 security-badge">
            <div className="card-body text-center py-3">
              <p className="mb-0 text-muted">
                <i className="bi bi-shield-check me-2 text-success"></i>
                <small>Your information is secure and will only be used to process your trip request.</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
