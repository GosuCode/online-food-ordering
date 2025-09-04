import "./AboutUs.css";
import chef from "../../assets/frontend_assets/chef.jpeg";
import our_story from "../../assets/frontend_assets/our_story.webp";
import delicious_food from "../../assets/frontend_assets/delicious_food.jpg";

// Icon components with both Ant Design and fallback support
const StarIcon = () => (
  <div className="icon-wrapper">
    <span className="icon-emoji">★</span>
    <span className="icon-svg">⭐</span>
  </div>
);

const ThunderIcon = () => (
  <div className="icon-wrapper">
    <span className="icon-emoji">⚡</span>
    <span className="icon-svg">⚡</span>
  </div>
);

const ServiceIcon = () => (
  <div className="icon-wrapper">
    <span className="icon-emoji">🎧</span>
    <span className="icon-svg">🎧</span>
  </div>
);

const EnvironmentIcon = () => (
  <div className="icon-wrapper">
    <span className="icon-emoji">🌱</span>
    <span className="icon-svg">🌱</span>
  </div>
);

const AboutUs = () => {
  return (
    <div className="about-us">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-content">
          <h1>About Our Food Delivery Service</h1>
          <p>
            Bringing delicious food to your doorstep with love, care, and
            commitment to quality since 2020.
          </p>
        </div>
        <div className="about-hero-image">
          <img src={delicious_food} alt="Delicious Food" />
        </div>
      </div>

      {/* Mission Section */}
      <div className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Our Mission</h2>
              <p>
                We believe that great food should be accessible to everyone,
                anywhere, anytime. Our mission is to connect people with their
                favorite local restaurants and deliver exceptional culinary
                experiences right to their doorstep.
              </p>
              <p>
                We&apos;re committed to supporting local businesses, ensuring
                food safety, and providing a seamless ordering experience that
                makes every meal memorable.
              </p>
            </div>
            <div className="about-image">
              <img src={chef} alt="Our Mission" />
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="about-section values-section">
        <div className="container">
          <h2 className="section-title">Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <StarIcon />
              </div>
              <h3>Quality First</h3>
              <p>
                We partner only with the best restaurants and ensure every dish
                meets our high standards of freshness and taste.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <ThunderIcon />
              </div>
              <h3>Fast Delivery</h3>
              <p>
                Our efficient delivery network ensures your food arrives hot and
                fresh within 30 minutes of ordering.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <ServiceIcon />
              </div>
              <h3>Customer Support</h3>
              <p>
                24/7 customer support to help you with any questions or concerns
                about your order.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <EnvironmentIcon />
              </div>
              <h3>Sustainability</h3>
              <p>
                Eco-friendly packaging and sustainable practices to reduce our
                environmental footprint.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div
        className="about-section stats-section"
        style={{ backgroundColor: "#ff8181" }}
      >
        <div className="container">
          <h2 className="section-title">Our Impact</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>50K+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Partner Restaurants</p>
            </div>
            <div className="stat-item">
              <h3>1M+</h3>
              <p>Orders Delivered</p>
            </div>
            <div className="stat-item">
              <h3>4.8★</h3>
              <p>Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      {/* <div className="about-section team-section">
        <div className="container">
          <h2 className="section-title">Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-image">
                <img src={assets.food_7} alt="Team Member" />
              </div>
              <h3>Sarah Johnson</h3>
              <p>CEO & Founder</p>
              <p className="member-bio">
                Passionate about food and technology, Sarah started this company
                to revolutionize food delivery.
              </p>
            </div>
            <div className="team-member">
              <div className="member-image">
                <img src={assets.food_8} alt="Team Member" />
              </div>
              <h3>Michael Chen</h3>
              <p>Head of Operations</p>
              <p className="member-bio">
                With 10+ years in logistics, Michael ensures smooth operations
                and timely deliveries.
              </p>
            </div>
            <div className="team-member">
              <div className="member-image">
                <img src={assets.food_9} alt="Team Member" />
              </div>
              <h3>Emily Rodriguez</h3>
              <p>Customer Experience Lead</p>
              <p className="member-bio">
                Emily leads our customer support team to ensure every customer
                has an amazing experience.
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Story Section */}
      <div className="about-section story-section">
        <div className="container">
          <div className="story-content">
            <div className="story-image">
              <img src={our_story} alt="Our Story" />
            </div>
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                It all started in 2020 when we realized that people needed a
                reliable way to enjoy restaurant-quality food from the comfort
                of their homes. What began as a small local service has grown
                into a trusted platform serving thousands of customers daily.
              </p>
              <p>
                We&apos;ve built strong relationships with local restaurants,
                creating a win-win ecosystem where customers get great food,
                restaurants increase their reach, and we facilitate the
                connection.
              </p>
              <p>
                Today, we&apos;re proud to be part of your daily meals and
                special occasions, bringing families and friends together over
                delicious food.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="about-cta">
        <div className="container">
          <h2>Ready to Experience Great Food?</h2>
          <p>
            Join thousands of satisfied customers and order your next meal
            today!
          </p>
          <div className="cta-buttons">
            <a href="/menu" className="cta-button primary">
              Browse Menu
            </a>
            <a href="/" className="cta-button secondary">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
