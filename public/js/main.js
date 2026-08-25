const API = '/api/public';

const data = {
  services: [
    { icon: 'fa-tooth', name: 'General Dentistry', desc: 'Comprehensive oral health checkups and preventive care for the whole family.' },
    { icon: 'fa-sparkles', name: 'Dental Cleaning', desc: 'Professional scaling and polishing to keep your gums healthy and bright.' },
    { icon: 'fa-star', name: 'Teeth Whitening', desc: 'Advanced whitening treatments for a noticeably brighter, confident smile.' },
    { icon: 'fa-syringe', name: 'Root Canal Treatment', desc: 'Pain-free root canal therapy to save your natural tooth from extraction.' },
    { icon: 'fa-circle-dot', name: 'Dental Implants', desc: 'Permanent, natural-looking tooth replacement with titanium implants.' },
    { icon: 'fa-crown', name: 'Crowns & Bridges', desc: 'Custom-crafted restorations to protect and restore damaged teeth.' },
    { icon: 'fa-fill-drip', name: 'Dental Fillings', desc: 'Tooth-colored composite fillings that blend seamlessly with your smile.' },
    { icon: 'fa-align-center', name: 'Braces & Orthodontics', desc: 'Metal, ceramic and invisible aligners for perfectly aligned teeth.' },
    { icon: 'fa-child', name: 'Pediatric Dentistry', desc: 'Gentle, child-friendly dental care designed for young patients.' },
    { icon: 'fa-heart-pulse', name: 'Gum Treatment', desc: 'Advanced periodontal therapy for healthy gums and strong foundations.' },
    { icon: 'fa-wand-magic-sparkles', name: 'Cosmetic Dentistry', desc: 'Smile makeovers, veneers and aesthetic enhancements for your best smile.' },
    { icon: 'fa-scissors', name: 'Tooth Extraction', desc: 'Safe, comfortable tooth removal with minimal discomfort and fast healing.' },
  ],
  testimonials: [
    { name: 'Priya Sharma', role: 'Teeth Whitening Patient', text: 'The team at RKS made me feel completely at ease. My teeth look incredible — I couldn\'t be happier with the results. Truly professional and caring.', initials: 'PS' },
    { name: 'Rahul Mehta', role: 'Implant Patient', text: 'I was nervous about getting an implant, but Dr. Kumar explained everything clearly. The procedure was smooth and the result is perfect. Highly recommend.', initials: 'RM' },
    { name: 'Anita Patel', role: 'Orthodontics Patient', text: 'My daughter has been coming here for braces and the experience has been wonderful. The staff are so patient and kind with children.', initials: 'AP' },
    { name: 'Vikram Singh', role: 'Root Canal Patient', text: 'I was dreading the root canal but it was completely painless. The clinic is modern, clean and the doctors are highly skilled. 5 stars.', initials: 'VS' },
    { name: 'Meera Nair', role: 'General Checkup', text: 'Best dental clinic I\'ve visited. The environment is calm and welcoming, and the team genuinely cares about your comfort. Will not go anywhere else.', initials: 'MN' },
    { name: 'Arjun Kapoor', role: 'Smile Makeover', text: 'RKS transformed my smile completely. The cosmetic work is exceptional — natural-looking and beautifully done. Worth every rupee.', initials: 'AK' },
  ],
  faqs: [
    { q: 'How do I book an appointment?', a: 'You can book an appointment by filling out the contact form on this page, calling our clinic directly, or sending us a WhatsApp message. We will confirm your appointment within a few hours.' },
    { q: 'What dental treatments do you provide?', a: 'We offer a comprehensive range of dental services including general dentistry, cosmetic treatments, orthodontics, implants, root canal therapy, gum treatment, pediatric dentistry and much more.' },
    { q: 'How often should I visit a dentist?', a: 'We recommend a routine dental checkup and cleaning every 6 months. Regular visits help detect issues early and maintain optimal oral health.' },
    { q: 'Do you provide emergency dental care?', a: 'Yes, we accommodate dental emergencies. Please call our clinic immediately and we will do our best to see you on the same day.' },
    { q: 'Do you treat children?', a: 'Absolutely. Our pediatric dentistry team specializes in providing gentle, child-friendly care in a comfortable and welcoming environment.' },
    { q: 'How long does a dental consultation take?', a: 'A standard consultation typically takes 30 to 45 minutes. Complex cases or treatment planning sessions may take longer.' },
    { q: 'Do you provide cosmetic dentistry?', a: 'Yes, we offer a full range of cosmetic dental treatments including teeth whitening, veneers, smile makeovers, composite bonding and more.' },
  ],
  doctors: [
    { name: 'Dr. Rajesh Kumar', qual: 'BDS, MDS (Oral Surgery)', spec: 'Oral & Maxillofacial Surgery', exp: '15+ Years Experience', bio: 'Dr. Kumar brings over 15 years of surgical expertise, specializing in complex extractions, implants and oral reconstructive procedures.', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80' },
    { name: 'Dr. Sunita Sharma', qual: 'BDS, MDS (Orthodontics)', spec: 'Orthodontics & Aligners', exp: '12+ Years Experience', bio: 'Dr. Sharma is a specialist in orthodontic treatment, helping patients achieve beautifully aligned smiles with braces and clear aligners.', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80' },
    { name: 'Dr. Anil Verma', qual: 'BDS, MDS (Prosthodontics)', spec: 'Cosmetic & Restorative Dentistry', exp: '10+ Years Experience', bio: 'Dr. Verma specializes in smile makeovers, crowns, bridges and full-mouth rehabilitation, combining artistry with clinical precision.', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80' },
  ],
};

function render() {
  document.getElementById('app').innerHTML = `
    ${navbar()}
    <div class="mobile-menu" id="mobileMenu">
      <button class="mobile-menu-close" id="menuClose"><i class="fas fa-times"></i></button>
      <a href="#home" onclick="closeMobile()">Home</a>
      <a href="#about" onclick="closeMobile()">About</a>
      <a href="#services" onclick="closeMobile()">Services</a>
      <a href="#doctors" onclick="closeMobile()">Doctors</a>
      <a href="#why" onclick="closeMobile()">Why RKS</a>
      <a href="#testimonials" onclick="closeMobile()">Testimonials</a>
      <a href="#contact" onclick="closeMobile()">Contact</a>
      <a href="#contact" class="btn btn-primary" onclick="closeMobile()">Book Appointment</a>
    </div>
    ${hero()}
    ${about()}
    ${services()}
    ${featured()}
    ${why()}
    ${doctors()}
    ${journey()}
    ${testimonials()}
    ${beforeAfter()}
    ${faq()}
    ${ctaBanner()}
    ${contact()}
    ${footer()}
    <div class="sticky-mobile-cta">
      <a href="#contact" class="btn btn-primary"><i class="fas fa-calendar-check"></i> Book Appointment</a>
    </div>
  `;
  initAll();
}

function navbar() {
  return `<nav class="navbar" id="navbar">
    <div class="container">
      <div class="navbar-inner">
        <a href="#home" class="navbar-logo"><strong>RKS</strong><span>Dental Clinic</span></a>
        <ul class="navbar-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#doctors">Doctors</a></li>
          <li><a href="#why">Why RKS</a></li>
          <li><a href="#testimonials">Testimonials</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a href="#contact" class="btn btn-primary navbar-cta">Book Appointment</a>
        <button class="hamburger" id="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>`;
}

function hero() {
  return `<section class="hero" id="home">
    <div class="hero-orb hero-orb-1"></div>
    <div class="hero-orb hero-orb-2"></div>
    <div class="hero-orb hero-orb-3"></div>
    <div class="container">
      <div class="hero-grid">
        <div class="hero-content fade-up">
          <div class="hero-badge"><i class="fas fa-shield-halved"></i> Trusted Dental Care Since 2014</div>
          <div class="hero-clinic-name" id="heroClinicName"></div>
          <h1 class="hero-title">Your Smile.<br><span>Our Precision.</span></h1>
          <p class="hero-subtitle">Advanced dental care delivered with expertise, comfort and a personalized approach.</p>
          <div class="hero-actions">
            <a href="#contact" class="btn btn-primary"><i class="fas fa-calendar-check"></i> Book an Appointment</a>
            <a href="#services" class="btn btn-ghost"><i class="fas fa-grid-2"></i> Explore Our Services</a>
          </div>
          <div class="hero-stats">
            <div class="hero-stat"><div class="hero-stat-num">10+</div><div class="hero-stat-label">Years Experience</div></div>
            <div class="hero-stat"><div class="hero-stat-num">5K+</div><div class="hero-stat-label">Happy Patients</div></div>
            <div class="hero-stat"><div class="hero-stat-num">15+</div><div class="hero-stat-label">Treatments</div></div>
            <div class="hero-stat"><div class="hero-stat-num">98%</div><div class="hero-stat-label">Satisfaction</div></div>
          </div>
        </div>
        <div class="hero-image-wrap fade-in">
          <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80" alt="Modern dental clinic" loading="eager">
          <div class="hero-float-card float-1">
            <div class="icon"><i class="fas fa-award"></i></div>
            <div><div class="label">Recognition</div><div class="value">10+ Years Experience</div></div>
          </div>
          <div class="hero-float-card float-2">
            <div class="icon"><i class="fas fa-users"></i></div>
            <div><div class="label">Community</div><div class="value">5000+ Happy Patients</div></div>
          </div>
          <div class="hero-float-card float-3">
            <div class="icon"><i class="fas fa-microscope"></i></div>
            <div><div class="label">Technology</div><div class="value">Advanced Dental Care</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function about() {
  return `<section class="about" id="about">
    <div class="container">
      <div class="grid-2">
        <div class="about-image-wrap fade-left">
          <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=700&q=80" alt="RKS Dental Clinic interior" loading="lazy">
          <div class="about-image-badge">
            <div class="num">98%</div>
            <div class="lbl">Patient Satisfaction</div>
          </div>
        </div>
        <div class="about-content fade-right">
          <div class="section-label">About Us</div>
          <h2 class="section-title">Dentistry Designed Around You</h2>
          <p class="about-desc">At RKS Dental Clinic, we combine clinical expertise, modern technology and compassionate care to create healthy, confident smiles. Every patient receives a personalized treatment plan tailored to their unique needs and goals.</p>
          <p style="margin-bottom:2.5rem">Our state-of-the-art facility is designed to make you feel comfortable from the moment you walk in — because great dental care begins with a great experience.</p>
          <div class="stats-grid">
            <div class="stat-card"><div class="stat-num counter" data-target="10">0</div><div class="stat-label">Years of Experience</div></div>
            <div class="stat-card"><div class="stat-num counter" data-target="5000">0</div><div class="stat-label">Patients Served</div></div>
            <div class="stat-card"><div class="stat-num counter" data-target="15">0</div><div class="stat-label">Dental Treatments</div></div>
            <div class="stat-card"><div class="stat-num counter" data-target="98">0</div><div class="stat-label">% Patient Satisfaction</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function services() {
  const cards = data.services.map((s, i) => `
    <div class="service-card fade-up delay-${(i % 4) + 1}">
      <div class="service-icon"><i class="fas ${s.icon}"></i></div>
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
      <a href="#contact" class="service-link">Learn More <i class="fas fa-arrow-right"></i></a>
    </div>`).join('');
  return `<section class="services" id="services">
    <div class="container">
      <div class="services-header text-center fade-up">
        <div class="section-label">Our Services</div>
        <h2 class="section-title">Complete Dental Care.<br>Under One Roof.</h2>
        <p class="section-subtitle">From routine checkups to advanced cosmetic procedures — everything your smile needs, all in one place.</p>
      </div>
      <div class="services-grid">${cards}</div>
    </div>
  </section>`;
}

function featured() {
  return `<section class="featured" id="featured">
    <div class="container">
      <div class="featured-inner">
        <div class="featured-image fade-left">
          <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=700&q=80" alt="Cosmetic dentistry" loading="lazy">
        </div>
        <div class="featured-content fade-right">
          <div class="section-label">Smile Transformation</div>
          <h2>Transform Your Smile</h2>
          <p>Modern cosmetic and restorative dentistry designed to give you a smile you can confidently share with the world.</p>
          <ul class="featured-list">
            <li><i class="fas fa-check-circle"></i> Porcelain veneers and composite bonding</li>
            <li><i class="fas fa-check-circle"></i> Professional teeth whitening</li>
            <li><i class="fas fa-check-circle"></i> Full smile makeover planning</li>
            <li><i class="fas fa-check-circle"></i> Digital smile design preview</li>
          </ul>
          <a href="#contact" class="btn btn-primary"><i class="fas fa-calendar-check"></i> Book a Consultation</a>
        </div>
      </div>
    </div>
  </section>`;
}

function why() {
  const features = [
    { icon: 'fa-user-doctor', title: 'Experienced Dental Professionals', desc: 'Our team brings years of clinical expertise across all dental specialties.' },
    { icon: 'fa-microscope', title: 'Modern Technology', desc: 'Advanced equipment and modern treatment techniques for precise, comfortable care.' },
    { icon: 'fa-clipboard-list', title: 'Personalized Treatment', desc: 'Every treatment plan is designed around the individual patient\'s needs and goals.' },
    { icon: 'fa-couch', title: 'Comfortable Environment', desc: 'A calm, welcoming experience from consultation through to treatment completion.' },
    { icon: 'fa-comments-dollar', title: 'Transparent Care', desc: 'Clear communication about all treatments, procedures and associated costs.' },
    { icon: 'fa-house-medical', title: 'Complete Dental Care', desc: 'Comprehensive dental services for individuals, children and families.' },
  ];
  const cards = features.map((f, i) => `
    <div class="why-card fade-up delay-${(i % 3) + 1}">
      <div class="why-icon"><i class="fas ${f.icon}"></i></div>
      <h3>${f.title}</h3>
      <p>${f.desc}</p>
    </div>`).join('');
  return `<section class="why" id="why">
    <div class="container">
      <div class="text-center fade-up">
        <div class="section-label">Why Choose Us</div>
        <h2 class="section-title">Why Patients Choose RKS</h2>
        <p class="section-subtitle">We go beyond dentistry to deliver an experience that is comfortable, transparent and truly patient-centred.</p>
      </div>
      <div class="why-grid">${cards}</div>
    </div>
  </section>`;
}

function doctors() {
  const cards = data.doctors.map((d, i) => `
    <div class="doctor-card fade-up delay-${i + 1}">
      <div class="doctor-img"><img src="${d.img}" alt="${d.name}" loading="lazy"></div>
      <div class="doctor-info">
        <span class="doctor-qual">${d.qual}</span>
        <h3>${d.name}</h3>
        <div class="doctor-spec">${d.spec}</div>
        <div class="doctor-exp"><i class="fas fa-clock" style="color:var(--primary);margin-right:4px"></i>${d.exp}</div>
        <p class="doctor-bio">${d.bio}</p>
        <a href="#contact" class="btn btn-outline" style="padding:0.6rem 1.25rem;font-size:0.85rem">View Profile</a>
      </div>
    </div>`).join('');
  return `<section class="doctors" id="doctors">
    <div class="container">
      <div class="text-center fade-up">
        <div class="section-label">Our Team</div>
        <h2 class="section-title">Meet Your Dental Care Team</h2>
        <p class="section-subtitle">Experienced, compassionate professionals dedicated to your oral health and comfort.</p>
      </div>
      <div class="doctors-grid">${cards}</div>
    </div>
  </section>`;
}

function journey() {
  const steps = [
    { num: '01', title: 'Book', desc: 'Schedule your appointment online, by phone or WhatsApp at your convenience.' },
    { num: '02', title: 'Consult', desc: 'Meet our dental team and discuss your concerns, goals and treatment options.' },
    { num: '03', title: 'Treat', desc: 'Receive a personalized treatment plan delivered with precision and care.' },
    { num: '04', title: 'Smile', desc: 'Leave with a healthier, more confident smile and ongoing support.' },
  ];
  const html = steps.map(s => `
    <div class="journey-step fade-up">
      <div class="step-num">${s.num}</div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </div>`).join('');
  return `<section class="journey" id="journey">
    <div class="container">
      <div class="text-center fade-up">
        <div class="section-label">Your Journey</div>
        <h2 class="section-title">Your Path to a Better Smile</h2>
      </div>
      <div class="journey-steps">${html}</div>
    </div>
  </section>`;
}

function testimonials() {
  const cards = data.testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"${t.text}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${t.initials}</div>
        <div><div class="testimonial-name">${t.name}</div><div class="testimonial-role">${t.role}</div></div>
      </div>
    </div>`).join('');
  const dots = data.testimonials.map((_, i) => `<div class="carousel-dot ${i===0?'active':''}" data-index="${i}"></div>`).join('');
  return `<section class="testimonials" id="testimonials">
    <div class="container">
      <div class="text-center fade-up">
        <div class="section-label">Patient Reviews</div>
        <h2 class="section-title">What Our Patients Say</h2>
        <p class="section-subtitle">Real experiences from real patients who trust RKS Dental Clinic with their smiles.</p>
      </div>
      <div class="testimonials-carousel fade-up">
        <div class="testimonials-track" id="testimonialsTrack">${cards}</div>
      </div>
      <div class="carousel-controls">
        <button class="carousel-btn" id="prevBtn"><i class="fas fa-chevron-left"></i></button>
        <div class="carousel-dots" id="carouselDots">${dots}</div>
        <button class="carousel-btn" id="nextBtn"><i class="fas fa-chevron-right"></i></button>
      </div>
    </div>
  </section>`;
}

function beforeAfter() {
  const cases = [
    { cat: 'Teeth Whitening', title: 'Professional Whitening', before: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=300&q=70', after: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=300&q=70' },
    { cat: 'Smile Makeover', title: 'Complete Smile Transformation', before: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300&q=70', after: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=300&q=70' },
    { cat: 'Restorative Dentistry', title: 'Crown & Bridge Restoration', before: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&q=70', after: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=70' },
  ];
  const cards = cases.map(c => `
    <div class="ba-card fade-up">
      <div class="ba-images">
        <div><img src="${c.before}" alt="Before"><span class="ba-label">Before</span></div>
        <div><img src="${c.after}" alt="After"><span class="ba-label">After</span></div>
      </div>
      <div class="ba-info">
        <div class="ba-category">${c.cat}</div>
        <h3>${c.title}</h3>
      </div>
    </div>`).join('');
  return `<section class="before-after" id="results">
    <div class="container">
      <div class="text-center fade-up">
        <div class="section-label">Treatment Results</div>
        <h2 class="section-title">Real Results. Confident Smiles.</h2>
        <p class="section-subtitle">A selection of treatment outcomes from our patients. Individual results may vary.</p>
      </div>
      <div class="ba-grid">${cards}</div>
    </div>
  </section>`;
}

function faq() {
  const items = data.faqs.map((f, i) => `
    <div class="faq-item ${i===0?'open':''}" data-faq="${i}">
      <div class="faq-question"><span>${f.q}</span><i class="fas fa-chevron-down"></i></div>
      <div class="faq-answer"><p>${f.a}</p></div>
    </div>`).join('');
  return `<section class="faq" id="faq">
    <div class="container">
      <div class="text-center fade-up">
        <div class="section-label">FAQ</div>
        <h2 class="section-title">Frequently Asked Questions</h2>
      </div>
      <div class="faq-list">${items}</div>
    </div>
  </section>`;
}

function ctaBanner() {
  return `<section class="cta-banner">
    <div class="container fade-up">
      <h2>Ready to Love Your Smile?</h2>
      <p>Take the first step towards healthier, more confident teeth.</p>
      <div class="cta-actions">
        <a href="#contact" class="btn btn-white"><i class="fas fa-calendar-check"></i> Book Your Appointment</a>
        <a href="tel:+919876543210" class="btn btn-ghost"><i class="fas fa-phone"></i> Call the Clinic</a>
      </div>
    </div>
  </section>`;
}

function contact() {
  const serviceOptions = data.services.map(s => `<option>${s.name}</option>`).join('');
  return `<section class="contact" id="contact">
    <div class="container">
      <div class="text-center fade-up" style="margin-bottom:3.5rem">
        <div class="section-label">Get In Touch</div>
        <h2 class="section-title">Book Your Appointment</h2>
        <p class="section-subtitle">We'd love to hear from you. Fill in the form or reach us directly.</p>
      </div>
      <div class="contact-grid">
        <div class="contact-info fade-up">
          <h3>RKS Dental Clinic</h3>
          <div class="contact-item">
            <div class="contact-item-icon"><i class="fas fa-location-dot"></i></div>
            <div class="contact-item-text"><div class="label">Address</div><div class="value">123 Health Avenue, Medical District<br>Mumbai, Maharashtra 400001</div></div>
          </div>
          <div class="contact-item">
            <div class="contact-item-icon"><i class="fas fa-phone"></i></div>
            <div class="contact-item-text"><div class="label">Phone</div><div class="value"><a href="tel:+919876543210">+91 98765 43210</a></div></div>
          </div>
          <div class="contact-item">
            <div class="contact-item-icon"><i class="fab fa-whatsapp"></i></div>
            <div class="contact-item-text"><div class="label">WhatsApp</div><div class="value"><a href="https://wa.me/919876543210">+91 98765 43210</a></div></div>
          </div>
          <div class="contact-item">
            <div class="contact-item-icon"><i class="fas fa-envelope"></i></div>
            <div class="contact-item-text"><div class="label">Email</div><div class="value"><a href="mailto:info@rksdental.com">info@rksdental.com</a></div></div>
          </div>
          <div class="contact-item">
            <div class="contact-item-icon"><i class="fas fa-clock"></i></div>
            <div class="contact-item-text"><div class="label">Opening Hours</div><div class="value">Mon–Sat: 9:00 AM – 8:00 PM<br>Sunday: 10:00 AM – 2:00 PM</div></div>
          </div>
          <div class="map-embed">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1699000000000!5m2!1sen!2sin" allowfullscreen loading="lazy"></iframe>
          </div>
        </div>
        <div class="contact-form fade-up">
          <h3>Request an Appointment</h3>
          <form id="contactForm">
            <div class="form-row">
              <div class="form-group"><label>Full Name *</label><input type="text" name="name" placeholder="Your full name" required></div>
              <div class="form-group"><label>Phone Number *</label><input type="tel" name="phone" placeholder="+91 00000 00000" required></div>
            </div>
            <div class="form-group"><label>Email Address</label><input type="email" name="email" placeholder="your@email.com"></div>
            <div class="form-row">
              <div class="form-group"><label>Preferred Date</label><input type="date" name="preferred_date"></div>
              <div class="form-group"><label>Preferred Time</label><input type="time" name="preferred_time"></div>
            </div>
            <div class="form-group"><label>Service Required</label><select name="service"><option value="">Select a service</option>${serviceOptions}</select></div>
            <div class="form-group"><label>Message</label><textarea name="message" placeholder="Tell us about your dental concern..."></textarea></div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center"><i class="fas fa-paper-plane"></i> Send Request</button>
            <div class="form-success" id="formSuccess"><i class="fas fa-check-circle"></i> Thank you! We will contact you shortly to confirm your appointment.</div>
          </form>
        </div>
      </div>
    </div>
  </section>`;
}

function footer() {
  return `<footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo"><strong>RKS</strong> <span>Dental Clinic</span></div>
          <p>"Your Smile. Our Precision." — Advanced dental care delivered with expertise, comfort and a personalized approach.</p>
          <div class="footer-social">
            <a href="#" class="social-btn"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="social-btn"><i class="fab fa-instagram"></i></a>
            <a href="#" class="social-btn"><i class="fab fa-twitter"></i></a>
            <a href="https://wa.me/919876543210" class="social-btn"><i class="fab fa-whatsapp"></i></a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#doctors">Our Doctors</a></li>
            <li><a href="#why">Why RKS</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Services</h4>
          <ul>
            <li><a href="#services">General Dentistry</a></li>
            <li><a href="#services">Teeth Whitening</a></li>
            <li><a href="#services">Dental Implants</a></li>
            <li><a href="#services">Orthodontics</a></li>
            <li><a href="#services">Root Canal</a></li>
            <li><a href="#services">Cosmetic Dentistry</a></li>
          </ul>
        </div>
        <div class="footer-col footer-hours">
          <h4>Opening Hours</h4>
          <p>Monday – Friday<br><span>9:00 AM – 8:00 PM</span></p>
          <p style="margin-top:0.75rem">Saturday<br><span>9:00 AM – 6:00 PM</span></p>
          <p style="margin-top:0.75rem">Sunday<br><span>10:00 AM – 2:00 PM</span></p>
          <a href="tel:+919876543210" class="btn btn-primary" style="margin-top:1.5rem;padding:0.6rem 1.25rem;font-size:0.85rem"><i class="fas fa-phone"></i> Call Now</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} RKS Dental Clinic. All rights reserved.</p>
        <div class="footer-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
        </div>
      </div>
    </div>
  </footer>`;
}

function initAll() {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initCounters();
  initCarousel();
  initFAQ();
  initContactForm();
  initTypewriter();
}

function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function initMobileMenu() {
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.add('open');
  });
  document.getElementById('menuClose').addEventListener('click', closeMobile);
}

function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.fade-up, .fade-in, .fade-left, .fade-right').forEach(el => observer.observe(el));
}

function initTypewriter() {
  const el = document.getElementById('heroClinicName');
  if (!el) return;
  el.textContent = 'RKS Dental Clinic';
}

function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = +el.dataset.target;
        const suffix = target >= 1000 ? '+' : target === 98 ? '%' : '+';
        const duration = 1800;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = (target >= 1000 ? Math.floor(current/1000)+'K' : Math.floor(current)) + suffix;
          if (current >= target) clearInterval(timer);
        }, 16);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.counter').forEach(el => observer.observe(el));
}

function initCarousel() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;
  const dots = document.querySelectorAll('.carousel-dot');
  let current = 0;
  const total = data.testimonials.length;
  const visible = window.innerWidth < 768 ? 1 : 3;

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, total - visible));
    const cardWidth = track.children[0].offsetWidth + 24;
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  document.getElementById('prevBtn').addEventListener('click', () => goTo(current - 1));
  document.getElementById('nextBtn').addEventListener('click', () => goTo(current + 1));
  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.index)));

  let autoplay = setInterval(() => goTo((current + 1) % (total - visible + 1)), 4000);
  track.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.addEventListener('mouseleave', () => { autoplay = setInterval(() => goTo((current + 1) % (total - visible + 1)), 4000); });
}

function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    const body = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('/api/public/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        form.reset();
        document.getElementById('formSuccess').style.display = 'block';
        btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
      } else {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Request';
        alert(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Request';
    }
  });
}

render();
