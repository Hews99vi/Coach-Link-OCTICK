import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import SkipLink from './SkipLink';

const LandingPage = () => {
  return (
    <>
      <SkipLink />
      <div className="landing-page" id="main-content">
      {/* Hero Section */}
      <section className="hero-section">
        <nav className="navbar navbar-expand-lg navbar-dark">
          <div className="container">
            <a className="navbar-brand" href="/">
              <i className="bi bi-bus-front-fill"></i> Coach-Link
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <a className="nav-link" href="#about">About</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#services">Services</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#features">Features</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#contact">Contact</a>
                </li>
                <li className="nav-item">
                  <Link className="nav-link btn btn-outline-light ms-2" to="/login">
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="hero-content">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <h1 className="hero-title">
                  Professional Transportation Management Made Simple
                </h1>
                <p className="hero-subtitle">
                  Coach-Link provides seamless transportation request management
                  for your organization. Book vehicles, track requests, and manage
                  your fleet with ease.
                </p>
                <div className="hero-buttons">
                  <Link to="/request" className="btn btn-primary btn-lg me-3">
                    <i className="bi bi-calendar-check"></i> Book a Service
                  </Link>
                  <a href="#features" className="btn btn-outline-light btn-lg">
                    Learn More
                  </a>
                </div>
                <div className="hero-stats mt-4">
                  <div className="stat-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>500+ Trips Completed</span>
                  </div>
                  <div className="stat-item">
                    <i className="bi bi-people-fill"></i>
                    <span>50+ Satisfied Clients</span>
                  </div>
                  <div className="stat-item">
                    <i className="bi bi-star-fill"></i>
                    <span>4.9/5 Rating</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="hero-image">
                  <i className="bi bi-bus-front display-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <h2 className="section-title">About Coach-Link</h2>
              <p className="section-description">
                Coach-Link is a leading transportation management platform designed
                to streamline your organization's vehicle booking and fleet management
                needs. We provide a comprehensive solution that connects requesters,
                coordinators, and drivers in one unified platform.
              </p>
              <p className="section-description">
                Our mission is to make transportation management efficient, transparent,
                and hassle-free. With real-time tracking, automated workflows, and
                powerful analytics, we help organizations optimize their transportation
                operations.
              </p>
              <div className="about-features">
                <div className="about-feature-item">
                  <i className="bi bi-shield-check text-primary"></i>
                  <div>
                    <h5>Secure & Reliable</h5>
                    <p>Bank-level security for all your data</p>
                  </div>
                </div>
                <div className="about-feature-item">
                  <i className="bi bi-clock-history text-primary"></i>
                  <div>
                    <h5>24/7 Support</h5>
                    <p>Round-the-clock assistance when you need it</p>
                  </div>
                </div>
                <div className="about-feature-item">
                  <i className="bi bi-graph-up text-primary"></i>
                  <div>
                    <h5>Data-Driven Insights</h5>
                    <p>Analytics to optimize your fleet operations</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-image-placeholder">
                <i className="bi bi-geo-alt-fill display-1 text-primary"></i>
                <p className="mt-3">Trusted Transportation Solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">
              Comprehensive transportation solutions tailored to your needs
            </p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="service-card">
                <div className="service-icon">
                  <i className="bi bi-calendar-check-fill"></i>
                </div>
                <h4>Transportation Booking</h4>
                <p>
                  Easy-to-use booking system for scheduling transportation services.
                  Submit requests with detailed requirements including dates, times,
                  and passenger information.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="service-card">
                <div className="service-icon">
                  <i className="bi bi-truck-front-fill"></i>
                </div>
                <h4>Fleet Management</h4>
                <p>
                  Comprehensive fleet tracking and management. Monitor vehicle
                  availability, maintenance schedules, and optimize resource
                  allocation across your organization.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="service-card">
                <div className="service-icon">
                  <i className="bi bi-person-badge-fill"></i>
                </div>
                <h4>Driver Assignment</h4>
                <p>
                  Intelligent driver matching and assignment system. Ensure the
                  right driver is assigned based on availability, location, and
                  expertise.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="service-card">
                <div className="service-icon">
                  <i className="bi bi-graph-up-arrow"></i>
                </div>
                <h4>Analytics & Reporting</h4>
                <p>
                  Powerful analytics dashboard with real-time insights. Track
                  request trends, vehicle utilization, and make data-driven
                  decisions.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="service-card">
                <div className="service-icon">
                  <i className="bi bi-bell-fill"></i>
                </div>
                <h4>Real-Time Updates</h4>
                <p>
                  Stay informed with instant notifications about request status
                  changes, approvals, and important updates throughout the
                  transportation lifecycle.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="service-card">
                <div className="service-icon">
                  <i className="bi bi-gear-fill"></i>
                </div>
                <h4>Custom Solutions</h4>
                <p>
                  Tailored transportation management solutions designed to meet
                  your organization's unique requirements and workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Platform Features</h2>
            <p className="section-subtitle">
              Everything you need to manage transportation efficiently
            </p>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="feature-item">
                <i className="bi bi-lightning-charge-fill"></i>
                <h5>Quick Booking</h5>
                <p>Submit requests in under 2 minutes</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-item">
                <i className="bi bi-shield-lock-fill"></i>
                <h5>Secure Platform</h5>
                <p>End-to-end encryption & authentication</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-item">
                <i className="bi bi-phone-fill"></i>
                <h5>Mobile Responsive</h5>
                <p>Access from any device, anywhere</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-item">
                <i className="bi bi-clipboard-check-fill"></i>
                <h5>Request Tracking</h5>
                <p>Real-time status updates</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-item">
                <i className="bi bi-people-fill"></i>
                <h5>Multi-User Support</h5>
                <p>Roles for requesters, coordinators & drivers</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-item">
                <i className="bi bi-card-checklist"></i>
                <h5>Admin Dashboard</h5>
                <p>Comprehensive management interface</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-item">
                <i className="bi bi-pie-chart-fill"></i>
                <h5>Visual Analytics</h5>
                <p>Charts and reports for insights</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-item">
                <i className="bi bi-cloud-check-fill"></i>
                <h5>Cloud-Based</h5>
                <p>Reliable and scalable infrastructure</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="container text-center">
          <h2 className="text-white mb-4">Ready to Streamline Your Transportation?</h2>
          <p className="text-white mb-4">
            Join hundreds of organizations using Coach-Link for efficient
            transportation management
          </p>
          <Link to="/request" className="btn btn-light btn-lg">
            <i className="bi bi-calendar-check"></i> Book Your Service Now
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <h2 className="section-title">Get in Touch</h2>
              <p className="section-description">
                Have questions? We're here to help. Contact our team for more
                information about our services.
              </p>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="bi bi-geo-alt-fill"></i>
                  <div>
                    <h5>Address</h5>
                    <p>123 Transportation Way, City, State 12345</p>
                  </div>
                </div>
                <div className="contact-item">
                  <i className="bi bi-telephone-fill"></i>
                  <div>
                    <h5>Phone</h5>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="contact-item">
                  <i className="bi bi-envelope-fill"></i>
                  <div>
                    <h5>Email</h5>
                    <p>info@coachlink.com</p>
                  </div>
                </div>
                <div className="contact-item">
                  <i className="bi bi-clock-fill"></i>
                  <div>
                    <h5>Business Hours</h5>
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="contact-map-placeholder">
                <i className="bi bi-map display-1 text-primary"></i>
                <p className="mt-3">Interactive Map Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h5>
                <i className="bi bi-bus-front-fill"></i> Coach-Link
              </h5>
              <p>
                Professional transportation management platform for modern organizations.
              </p>
            </div>
            <div className="col-md-4">
              <h5>Quick Links</h5>
              <ul className="list-unstyled">
                <li><a href="#about">About Us</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#features">Features</a></li>
                <li><Link to="/request">Book Service</Link></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5>Connect With Us</h5>
              <div className="social-links">
                <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                <a href="#" aria-label="Twitter"><i className="bi bi-twitter"></i></a>
                <a href="#" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
                <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
              </div>
            </div>
          </div>
          <hr className="my-4" />
          <div className="text-center">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} Coach-Link. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default LandingPage;
