<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=social.displayInfo; section>
<#if section = "title">
    ${msg("loginTitle",(realm.displayName!''))}
    <#elseif section = "header">
    <#elseif section = "form">
    <#if realm.password>
    <div class="fullpage-background-image">
        <div class="container-wrapper">
            <div class="card-nav">
                <nav class="nav-links">
                    <a href="#" onclick="showAboutModal(event)" class="nav-link">About Us</a>
                    <a href="#" onclick="showContactModal(event)" class="nav-link">Contact Us</a>
                </nav>
            </div>
            <div class="ui header centered mb-8">
                <img onerror="" alt="">
                <h2 id="signIn" class="signInHead mt-8 mb-8">${msg("loginDiksha")}</h2>
                <!-- <p class="subtitle">Login</p> -->
            </div>
            <div class="content-section">
                <div class="left-section">
                    <div class="illustration-section">
                        <!-- <img src="${url.resourcesPath}/img/contact.png" alt="Contact Illustration"> -->
                        <video style="max-width: -webkit-fill-available;" height="315" controls>
                          <source src="https://storage.googleapis.com/ed-sunbird-public/landing-video/Video-02.mp4" type="video/mp4">
                        </video>
                    </div>
                </div>
                <div class="login-section">
                    <p id="mergeAccountMessage" class="hide mb-0 textCenter">${msg("mergeAccountMessage")}</p>
                    <p id="migrateAccountMessage" class="hide mb-0 textCenter">${msg("migrateAccountMessage")}</p>
                    <div class="formMsg textCenter mt-8">
                        <#if message?has_content>
                            <div id="error-summary" class="ui text ${message.type}">
                                ${message.summary}
                            </div>
                        </#if>
                        <div id="success-msg" class="ui text success hide">success</div>
                        <div id="error-msg" class="ui text error hide">error</div>
                    </div>
                    <form id="kc-form-login" onsubmit="login.disabled = true; return true;" class="ui form mt-16" method="POST" action="${url.loginAction}">
                        <p class="subtitle">Login</p>
                        <div class="field">
                            <label id="usernameLabel" for="username">
                                <#if !realm.loginWithEmailAllowed>${msg("username")}
                                <#elseif !realm.registrationEmailAsUsername>${msg("emailOrPhone")}
                                <#else>${msg("email")}
                                </#if>
                            </label>
                            <#if usernameEditDisabled??>
                                <input id="username" name="username" placeholder="Enter your email / mobile number" type="text" disabled />
                            <#else>
                                <input id="username" name="username" placeholder="Enter your email / mobile number" type="text" autofocus autocomplete="username" />
                            </#if>
                        </div>
                        <div class="field">
                            <label id="passwordLabel" for="password">
                                ${msg("password")}
                            </label>
                            <input placeholder="${msg('passwordPlaceholder')}" id="password" name="password" type="password" autocomplete="current-password" />
                            <span class="ui text error hide" id="inCorrectPasswordError">${msg("inCorrectPasswordError")}</span>
                        </div>
                        <!-- <div class="remember-forgot-row"> -->
                            <!-- <div class="forgot-password">
                                <#if realm.resetPasswordAllowed>
                                    <a id="fgtKeycloakFlow" class="ui right floated forgetPasswordLink" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
                                </#if>
                            </div> -->
                        <!-- </div> -->
                        <div class="field mb-8">
                            <button id="login" onclick="doLogin(event)" class="sb-btn sb-btn-normal sb-btn-primary width-100">${msg("login")}</button>
                        </div>
                        <#if realm.password && realm.registrationAllowed && !usernameEditDisabled??>
                            <!-- <div id="kc-registration" class="field">
                                <div class="ui content signUpMsg">
                                    ${msg("noAccount")} <span id="signup" role="link" tabindex="0" class="registerLink" onclick=navigate('self')>${msg("registerHere")}</span>
                                </div>
                            </div> -->
                        </#if>
                        <div id="selfSingUp" class="hide">
                            <p class="or my-16 textCenter">OR</p>
                            <div class="field">
                                    <button id="googleSignInBtn" type="button" class="sb-btn sb-btn-normal sb-btn-primary width-100 mb-16 btn-signInWithGoogle" onclick="navigate('google')">
                                        <img class="signInWithGoogle" alt="${msg('signIn')} ${msg('doSignWithGoogle')}" src="${url.resourcesPath}/img/google.svg">
                                        ${msg("signIn")} ${msg("doSignWithGoogle")}
                                    </button>
                            </div>
                        </div>
                    </form>
                    <a id="goBack" class="textCenter mt-16 hide cursor-pointer">${msg("goBack")}</a>
                </div>
            </div>
        </div>
    </div>
    <!-- About Us Modal -->
    <div id="aboutUsModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="about-title">About FMPS</h2>
                <span class="modal-close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="about-section">
                    <p>The Moroccan Foundation for the Promotion of PreSchool Education (FMPS) is a non-profit association recognized for its public utility since December 2009. Established on March 10, 2008, at the initiative of the Higher Education Council, and in collaboration with the Ministry of National Education, the Ministry of the Interior, and the Mohammed VI Foundation for the Promotion of Social Works of Education and Training, FMPS aims to generalize quality preschool education across Morocco.</p>

                    <h2>Our Mission</h2>
                    <p>FMPS is dedicated to developing and implementing the foundations for quality preschool education. Our mission encompasses:</p>
                    <ul>
                        <li>Establishing pillars for the development of quality preschool education.</li>
                        <li>Engineering preschool projects through the development and operationalization of mutually beneficial partnerships.</li>
                        <li>Implementing financing strategies to ensure the sustainability of preschool offerings.</li>
                        <li>Supporting and building the capacity of actors contributing to preschool development.</li>
                    </ul>

                    <h2>Our Vision</h2>
                    <p>FMPS strives to ensure that every Moroccan child benefits from quality preschool education by 2030. Our vision is based on the collective engagement of all industry stakeholders to generalize quality preschool education.</p>

                    <h2>Our Pillars</h2>
                    <div class="pillars-grid">
                        <div class="pillar-item">
                            <h3>Quality, Equality, and Equity</h3>
                            <p>Promoting a national preschool system that ensures quality education accessible to all children.</p>
                        </div>
                        <div class="pillar-item">
                            <h3>Efficient Operational Management and Control</h3>
                            <p>Implementing effective management strategies to maintain high standards in preschool education.</p>
                        </div>
                        <div class="pillar-item">
                            <h3>Innovation and Scientific Development</h3>
                            <p>Fostering innovation and contributing to the development of scientific knowledge in preschool education.</p>
                        </div>
                        <div class="pillar-item">
                            <h3>Quality Labeling</h3>
                            <p>Establishing a labeling system to develop a preschool system of consistent quality throughout Morocco.</p>
                        </div>
                    </div>

                    <h2>Our Achievements</h2>
                    <p>As of 2024, FMPS has established a network of 21,900 preschool classes across the kingdom, contributing significantly to the generalization of quality preschool education. We manage 70% of public preschool and 50% of national preschool education. Our integrated management model positions FMPS as a key player in the development of preschool education in Morocco.</p>

                    <h2>Governance</h2>
                    <p>FMPS operates under the leadership of a Board of Directors comprising esteemed professionals and experts in education and related fields. Our governance structure ensures strategic oversight and alignment with our mission and vision.</p>

                    <h2>FMPS Abhat Center</h2>
                    <p>In May 2017, FMPS established the Abhat Center to promote scientific research in early childhood education. The center serves as a foundation for educational practices at the preschool level, focusing on studies, research, scientific events, and partnerships to enhance the quality of preschool education.</p>

                    <p class="closing-statement">At FMPS, we are committed to nurturing the potential of every Moroccan child through quality preschool education, laying the foundation for a brighter future.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Contact Us Modal -->
    <div id="contactUsModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="about-title">Contact Us</h2>
                <span class="modal-close" onclick="closeContactModal()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="contactForm" class="contact-form" onsubmit="submitContactForm(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="firstName">First Name *</label>
                            <input type="text" id="firstName" name="firstName" required>
                        </div>
                        <div class="form-group">
                            <label for="lastName">Last Name *</label>
                            <input type="text" id="lastName" name="lastName" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="email">Email Address *</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone" pattern="[0-9]{10}">
                    </div>
                    <div class="form-group">
                        <label for="subject">Subject *</label>
                        <input type="text" id="subject" name="subject" required>
                    </div>
                    <div class="form-group">
                        <label for="message">Message *</label>
                        <textarea id="message" name="message" rows="5" required></textarea>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="sb-btn sb-btn-normal sb-btn-primary width-100">Send Message</button>
                    </div>
                    <div id="formMessage" class="form-message hide"></div>
                </form>

                <div class="contact-info mt-24">
                    <h3>Other Ways to Reach Us</h3>
                    <div class="contact-details">
                        <div class="contact-item">
                            <i class="contact-icon">📍</i>
                            <div>
                                <strong>Address:</strong>
                                <p>Sector 20, Avenue Ennakhil, No. 7, Hay Riad, 10 000 - Rabat</p>
                            </div>
                        </div>
                        <div class="contact-item">
                            <i class="contact-icon">📞</i>
                            <div>
                                <strong>Phone:</strong>
                                <p>05 37 56 35 37</p>
                            </div>
                        </div>
                        <div class="contact-item">
                            <i class="contact-icon">📠</i>
                            <div>
                                <strong>Fax:</strong>
                                <p>05 37 56 35 68</p>
                            </div>
                        </div>
                        <div class="contact-item">
                            <i class="contact-icon">✉️</i>
                            <div>
                                <strong>Email:</strong>
                                <p>info@fmps.ma</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </#if>
</#if>
</@layout.registrationLayout>

<script>
// Get the modals
var aboutModal = document.getElementById("aboutUsModal");
var contactModal = document.getElementById("contactUsModal");

// Function to show the about modal
function showAboutModal(e) {
    e.preventDefault();
    aboutModal.style.display = "block";
}

// Function to show the contact modal
function showContactModal(e) {
    e.preventDefault();
    contactModal.style.display = "block";
}

// Function to close contact modal
function closeContactModal() {
    contactModal.style.display = "none";
}

// Get the <span> elements that close the modals
var spans = document.getElementsByClassName("modal-close");
for(let span of spans) {
    span.onclick = function() {
        this.closest('.modal').style.display = "none";
    }
}

// When the user clicks anywhere outside of the modals, close them
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// Handle contact form submission
function submitContactForm(e) {
    e.preventDefault();

    const formMessage = document.getElementById("formMessage");
    formMessage.classList.remove("hide", "success", "error");
    formMessage.textContent = "Sending message...";

    // Get form values
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value || "Not provided";
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "firstName": firstName,
      "lastName": lastName,
      "email": email,
      "phoneNumber": phone,
      "subject": subject,
      "message": message
    });

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: raw,
      redirect: "follow"
    };

    fetch("https://fmps-contact-us-form-289106014647.asia-south1.run.app", requestOptions)
      .then((response) => {
        formMessage.textContent = "Thank you for your message! We'll get back to you soon.";
        formMessage.classList.add("success");
        document.getElementById("contactForm").reset();
      })
      .catch((error) => {
        console.error("Email sending failed:", error);
        formMessage.textContent = "Failed to send message. Please try again.";
        formMessage.classList.add("error");

      });

    // Hide message after 5 seconds
    setTimeout(() => formMessage.classList.add("hide"), 5000);
}
</script>
