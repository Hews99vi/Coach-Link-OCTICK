// Build a React form component for trip request: Fields for name, phone, pickup/dropoff locations, 
// pickup time (datetime-local), passengers (number), notes (textarea). Use useState for form data. 
// Client validation (required fields). On submit, axios POST to /requests, show success message or errors. 
// Add loading state with spinner.

import React, { useState } from 'react';
import axios from 'axios';

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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">
                <i className="bi bi-bus-front me-2"></i>
                Request a Trip
              </h2>

              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <strong>Success!</strong> Your trip request has been submitted successfully. 
                  We'll contact you soon.
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setSuccess(false)}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              {errors.length > 0 && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>Error!</strong> Please fix the following issues:
                  <ul className="mb-0 mt-2">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setErrors([])}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-3">
                  <label htmlFor="customer_name" className="form-label">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g., 555-1234"
                    required
                  />
                </div>

                {/* Pickup Location */}
                <div className="mb-3">
                  <label htmlFor="pickup_location" className="form-label">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="pickup_location"
                    name="pickup_location"
                    value={formData.pickup_location}
                    onChange={handleChange}
                    placeholder="e.g., Downtown Station"
                  />
                </div>

                {/* Dropoff Location */}
                <div className="mb-3">
                  <label htmlFor="dropoff_location" className="form-label">
                    Dropoff Location
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="dropoff_location"
                    name="dropoff_location"
                    value={formData.dropoff_location}
                    onChange={handleChange}
                    placeholder="e.g., Airport Terminal 1"
                  />
                </div>

                {/* Pickup Time */}
                <div className="mb-3">
                  <label htmlFor="pickup_time" className="form-label">
                    Pickup Date & Time <span className="text-danger">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="pickup_time"
                    name="pickup_time"
                    value={formData.pickup_time}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Passengers */}
                <div className="mb-3">
                  <label htmlFor="passengers" className="form-label">
                    Number of Passengers
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="passengers"
                    name="passengers"
                    value={formData.passengers}
                    onChange={handleChange}
                    min="1"
                    max="100"
                  />
                </div>

                {/* Notes */}
                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">
                    Additional Notes
                  </label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any special requirements or notes..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="text-center mt-3 text-muted">
            <small>
              <i className="bi bi-info-circle me-1"></i>
              Fields marked with <span className="text-danger">*</span> are required
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
